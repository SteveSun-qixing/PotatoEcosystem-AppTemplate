/**
 * 窗口管理器
 * @module main/window-manager
 * @description 管理 Electron 窗口的创建和生命周期
 *
 * 遵循规范：
 * - 前后端分离（设计原稿 10）：窗口管理属于系统能力，在主进程实现
 * - 配置系统（开发规范 4）：窗口参数通过配置管理，不硬编码
 */

import { BrowserWindow, shell, app } from 'electron';
import { join } from 'path';

/** 获取开发模式状态 */
function isDev(): boolean {
  return !app.isPackaged;
}

/** 窗口默认配置 */
const WINDOW_DEFAULTS = {
  width: 1200,
  height: 800,
  minWidth: 800,
  minHeight: 600,
};

/**
 * 创建主窗口
 * @returns BrowserWindow 实例
 */
export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: WINDOW_DEFAULTS.width,
    height: WINDOW_DEFAULTS.height,
    minWidth: WINDOW_DEFAULTS.minWidth,
    minHeight: WINDOW_DEFAULTS.minHeight,
    show: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // 窗口准备好后显示
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  // 外部链接在默认浏览器中打开
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // 加载页面
  if (isDev() && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../../src/renderer/index.html'));
  }

  return mainWindow;
}
