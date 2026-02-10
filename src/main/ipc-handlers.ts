/**
 * IPC 处理器
 * @module main/ipc-handlers
 * @description 处理渲染进程与主进程之间的 IPC 通信
 *
 * 遵循规范：
 * - 前后端分离（设计原稿 10）：主进程提供系统能力，渲染进程通过 IPC 调用
 * - 安全规范（开发规范 16）：所有输入需验证
 */

import { ipcMain, dialog, app, BrowserWindow } from 'electron';

/**
 * 注册所有 IPC 处理器
 */
export function registerIpcHandlers(): void {
  /**
   * 打开文件对话框
   */
  ipcMain.handle('dialog:open', async (_event, options?: Electron.OpenDialogOptions) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return { canceled: true, filePaths: [] };

    return dialog.showOpenDialog(win, {
      filters: [
        { name: 'Chips Card', extensions: ['card'] },
        { name: 'Chips Box', extensions: ['box'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
      ...options,
    });
  });

  /**
   * 保存文件对话框
   */
  ipcMain.handle('dialog:save', async (_event, defaultPath?: string) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return { canceled: true, filePath: '' };

    return dialog.showSaveDialog(win, {
      defaultPath,
      filters: [{ name: 'Chips Card', extensions: ['card'] }],
    });
  });

  /**
   * 获取应用版本
   */
  ipcMain.handle('app:get-version', () => {
    return app.getVersion();
  });

  /**
   * 获取应用路径
   */
  ipcMain.handle('app:get-path', (_event, name: string) => {
    const validPaths = ['home', 'appData', 'userData', 'temp', 'desktop', 'documents'];
    if (!validPaths.includes(name)) {
      throw new Error(`Invalid path name: ${name}`);
    }
    return app.getPath(name as Parameters<typeof app.getPath>[0]);
  });

  /**
   * 获取平台信息
   */
  ipcMain.handle('app:get-platform', () => {
    return process.platform;
  });

  /**
   * 窗口操作
   */
  ipcMain.handle('window:minimize', () => {
    BrowserWindow.getFocusedWindow()?.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    BrowserWindow.getFocusedWindow()?.close();
  });

  console.log('[AppTemplate] IPC 处理器注册完成');
}
