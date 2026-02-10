/**
 * 环境类型声明
 * @module renderer/env
 */

/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

declare module '*.yaml' {
  const content: Record<string, unknown>;
  export default content;
}

/** Electron API 类型声明（通过 preload 注入） */
interface Window {
  electronAPI: {
    platform: string;
    dialog: {
      open: (options?: Record<string, unknown>) => Promise<Electron.OpenDialogReturnValue>;
      save: (defaultPath?: string) => Promise<Electron.SaveDialogReturnValue>;
    };
    app: {
      getVersion: () => Promise<string>;
      getPath: (name: string) => Promise<string>;
      getPlatform: () => Promise<string>;
    };
    window: {
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
    };
    onMenuAction: (
      callback: (action: string, ...args: unknown[]) => void,
    ) => () => void;
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  };
}
