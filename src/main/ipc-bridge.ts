/**
 * IPC 桥接器
 * @module main/ipc-bridge
 * @description 在主进程中连接到 Chips-core，并通过 Electron IPC 暴露给渲染进程
 */

import { ipcMain } from 'electron';
import * as net from 'net';
import { EventEmitter } from 'events';

interface IpcRequest {
  id: string;
  message_type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

interface IpcResponse {
  request_id: string;
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
}

class CoreBridge extends EventEmitter {
  private socket: net.Socket | null = null;
  private connected = false;
  private buffer = '';
  private pendingRequests = new Map<string, (response: IpcResponse) => void>();

  constructor(
    private host: string = '127.0.0.1',
    private port: number = 9527
  ) {
    super();
  }

  /**
   * 连接到 Core
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new net.Socket();

      this.socket.on('connect', () => {
        console.log('[CoreBridge] 已连接到 Chips-core');
        this.connected = true;
        resolve();
      });

      this.socket.on('data', (data: Buffer) => {
        this.handleData(data);
      });

      this.socket.on('error', (error: Error) => {
        console.error('[CoreBridge] 连接错误:', error.message);
        this.connected = false;
        reject(error);
      });

      this.socket.on('close', () => {
        console.log('[CoreBridge] 连接已关闭');
        this.connected = false;
        this.emit('disconnect');
      });

      this.socket.connect(this.port, this.host);
    });
  }

  /**
   * 处理接收到的数据
   */
  private handleData(data: Buffer): void {
    this.buffer += data.toString();

    // 按行分割消息（NDJSON 格式）
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const response: IpcResponse = JSON.parse(line);
        const resolver = this.pendingRequests.get(response.request_id);
        if (resolver) {
          resolver(response);
          this.pendingRequests.delete(response.request_id);
        }
      } catch (error) {
        console.error('[CoreBridge] 解析响应失败:', error);
      }
    }
  }

  /**
   * 发送请求
   */
  async sendRequest(request: IpcRequest): Promise<IpcResponse> {
    if (!this.connected || !this.socket) {
      throw new Error('未连接到 Core');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        reject(new Error('请求超时'));
      }, 30000);

      this.pendingRequests.set(request.id, (response) => {
        clearTimeout(timeout);
        resolve(response);
      });

      const message = JSON.stringify(request) + '\n';
      this.socket!.write(message, (error) => {
        if (error) {
          clearTimeout(timeout);
          this.pendingRequests.delete(request.id);
          reject(error);
        }
      });
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    this.connected = false;
    this.pendingRequests.clear();
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.connected;
  }
}

// 全局桥接器实例
let bridge: CoreBridge | null = null;

/**
 * 初始化 IPC 桥接器
 */
export function initIpcBridge(): void {
  bridge = new CoreBridge();

  // 尝试连接
  bridge
    .connect()
    .then(() => {
      console.log('[IpcBridge] 桥接器初始化完成');
    })
    .catch((error) => {
      console.warn('[IpcBridge] 连接 Core 失败（可能内核未启动）:', error.message);
    });

  // 注册 IPC 处理器
  ipcMain.handle('core:request', async (_event, request: IpcRequest) => {
    if (!bridge || !bridge.isConnected()) {
      return {
        request_id: request.id,
        success: false,
        error: '未连接到 Core',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      return await bridge.sendRequest(request);
    } catch (error) {
      return {
        request_id: request.id,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  });

  ipcMain.handle('core:is-connected', () => {
    return bridge ? bridge.isConnected() : false;
  });
}

/**
 * 清理桥接器
 */
export function cleanupIpcBridge(): void {
  if (bridge) {
    bridge.disconnect();
    bridge = null;
  }
}
