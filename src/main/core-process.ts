/**
 * 内核进程管理
 * @module main/core-process
 * @description 管理薯片内核（Chips-core）进程的启动和停止
 *
 * 遵循规范：
 * - 中心路由架构（设计原稿 15）：应用通过内核路由与其他模块通信
 * - 底层内核和打包模式（设计原稿 13）：支持完全独立和共享内核两种模式
 */

import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';

/** 内核子进程 */
let coreProcess: ChildProcess | null = null;

/**
 * 获取内核可执行文件路径
 */
function getCorePath(): string {
  const isDev = !app.isPackaged;
  if (isDev) {
    return join(__dirname, '../../../Chips-core/target/debug/chips-core');
  }
  return join(process.resourcesPath, 'chips-core');
}

/**
 * 启动内核进程
 */
export function startCoreProcess(): void {
  const corePath = getCorePath();

  if (!existsSync(corePath)) {
    console.warn('[AppTemplate] 内核文件不存在，跳过启动:', corePath);
    console.warn('[AppTemplate] 将以无内核模式运行（开发阶段正常）');
    return;
  }

  console.log('[AppTemplate] 启动内核进程:', corePath);

  coreProcess = spawn(corePath, ['start', '--dev'], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  coreProcess.stdout?.on('data', (data: Buffer) => {
    console.log('[Core]', data.toString().trim());
  });

  coreProcess.stderr?.on('data', (data: Buffer) => {
    console.error('[Core Error]', data.toString().trim());
  });

  coreProcess.on('close', (code: number | null) => {
    console.log('[AppTemplate] 内核进程退出，退出码:', code);
    coreProcess = null;
  });

  coreProcess.on('error', (error: Error) => {
    console.error('[AppTemplate] 内核进程启动失败:', error.message);
    coreProcess = null;
  });
}

/**
 * 停止内核进程
 */
export function stopCoreProcess(): void {
  if (coreProcess) {
    console.log('[AppTemplate] 停止内核进程...');
    coreProcess.kill();
    coreProcess = null;
  }
}

/**
 * 获取内核进程状态
 */
export function isCoreRunning(): boolean {
  return coreProcess !== null && !coreProcess.killed;
}
