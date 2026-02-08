/**
 * Electron 预加载脚本
 * @module main/preload
 * @description 通过 contextBridge 安全暴露 API 到渲染进程
 *
 * 遵循规范：
 * - 前后端分离（设计原稿 10）：通过安全桥接暴露有限 API
 * - 安全规范（开发规范 16）：使用 contextIsolation，禁止 nodeIntegration
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

/**
 * 暴露给渲染进程的安全 API
 */
const electronAPI = {
  /** 平台标识 */
  platform: process.platform,

  /** 对话框操作 */
  dialog: {
    open: (options?: Record<string, unknown>): Promise<Electron.OpenDialogReturnValue> =>
      ipcRenderer.invoke('dialog:open', options),
    save: (defaultPath?: string): Promise<Electron.SaveDialogReturnValue> =>
      ipcRenderer.invoke('dialog:save', defaultPath),
  },

  /** 应用信息 */
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('app:get-version'),
    getPath: (name: string): Promise<string> => ipcRenderer.invoke('app:get-path', name),
    getPlatform: (): Promise<string> => ipcRenderer.invoke('app:get-platform'),
  },

  /** 窗口操作 */
  window: {
    minimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
    maximize: (): Promise<void> => ipcRenderer.invoke('window:maximize'),
    close: (): Promise<void> => ipcRenderer.invoke('window:close'),
  },

  /** 菜单事件监听 */
  onMenuAction: (
    callback: (action: string, ...args: unknown[]) => void,
  ): (() => void) => {
    const channels = ['menu:undo', 'menu:redo'];

    const handlers: Array<(event: IpcRendererEvent, ...args: unknown[]) => void> = [];

    channels.forEach((channel) => {
      const handler = (_event: IpcRendererEvent, ...args: unknown[]) => {
        callback(channel, ...args);
      };
      handlers.push(handler);
      ipcRenderer.on(channel, handler);
    });

    // 返回清理函数
    return () => {
      channels.forEach((channel, index) => {
        ipcRenderer.removeListener(channel, handlers[index]);
      });
    };
  },

  /** 通用 IPC 调用 */
  invoke: (channel: string, ...args: unknown[]): Promise<unknown> => {
    return ipcRenderer.invoke(channel, ...args);
  },
};

// 通过 contextBridge 安全暴露到 window 对象
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// TypeScript 类型声明
export type ElectronAPI = typeof electronAPI;
