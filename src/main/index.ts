/**
 * Chips AppTemplate - Electron 主进程入口
 * @module main
 * @description 薯片生态标准模板应用 - 主进程
 *
 * 遵循规范：
 * - 前后端分离（设计原稿 10）：主进程只负责系统能力
 * - 中心路由架构（设计原稿 15）：通过内核路由通信
 */

import { app, BrowserWindow } from 'electron';
import { createMainWindow } from './window-manager';
import { registerIpcHandlers } from './ipc-handlers';
import { setupApplicationMenu } from './menu';
import { startCoreProcess, stopCoreProcess } from './core-process';
import { initIpcBridge, cleanupIpcBridge } from './ipc-bridge';

/** 主窗口引用 */
let mainWindow: BrowserWindow | null = null;

/**
 * 应用初始化
 */
async function bootstrap(): Promise<void> {
  console.log('[AppTemplate] 启动薯片模板应用...');

  // 启动内核进程
  startCoreProcess();

  // 等待内核启动（给内核一些时间启动 IPC 服务器）
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 初始化 IPC 桥接器
  initIpcBridge();

  // 注册 IPC 处理器
  registerIpcHandlers();

  // 创建主窗口
  mainWindow = createMainWindow();

  // 设置应用菜单
  setupApplicationMenu(mainWindow);

  console.log('[AppTemplate] 初始化完成');
}

// 调试：打印变量
console.log('[DEBUG] typeof app:', typeof app);
console.log('[DEBUG] app:', app);

// 应用就绪
app.whenReady().then(() => {
  // 防止多实例
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
    return;
  }

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  bootstrap();

  // macOS: 点击 Dock 图标时恢复或重新创建窗口
  app.on('activate', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    } else if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow();
      setupApplicationMenu(mainWindow);
    }
  });
});

// 所有窗口关闭
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 应用退出前清理
app.on('before-quit', () => {
  cleanupIpcBridge();
  stopCoreProcess();
});
