/**
 * 应用菜单
 * @module main/menu
 * @description 应用菜单配置
 *
 * 遵循规范：
 * - 多语言支持（开发规范 3）：菜单文本通过 i18n 管理
 * - 快捷键规范（开发规范 9）：标准快捷键绑定
 *
 * 注意：主进程中菜单文本暂时使用硬编码，
 * 后续通过内核的多语言模块实现动态翻译。
 * 当前阶段菜单文本由渲染进程 i18n 系统管理。
 */

import { Menu, BrowserWindow, app, dialog } from 'electron';

/**
 * 发送消息到渲染进程
 */
function sendToRenderer(win: BrowserWindow, channel: string, ...args: unknown[]): void {
  win.webContents.send(channel, ...args);
}

/**
 * 设置应用菜单
 * @param mainWindow - 主窗口实例
 */
export function setupApplicationMenu(mainWindow: BrowserWindow): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        {
          label: 'About Chips AppTemplate',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'Chips AppTemplate',
              detail: `Version: ${app.getVersion()}\nChips Ecosystem Standard App Template\n\n© 2026 Chips Ecosystem`,
            });
          },
        },
        { type: 'separator' },
        ...(process.platform === 'darwin'
          ? ([
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
            ] as Electron.MenuItemConstructorOptions[])
          : []),
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: () => sendToRenderer(mainWindow, 'menu:undo'),
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: () => sendToRenderer(mainWindow, 'menu:redo'),
        },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(process.platform === 'darwin'
          ? ([
              { type: 'separator' as const },
              { role: 'front' as const },
            ] as Electron.MenuItemConstructorOptions[])
          : [{ role: 'close' as const }]),
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
