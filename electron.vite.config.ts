/**
 * Chips AppTemplate - electron-vite 构建配置
 * @description 薯片生态标准模板应用的构建配置
 */

import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * 薯片组件库源码根目录
 * 开发阶段直接引用组件库源码而非构建产物
 */
const componentLibrarySrc = resolve(
  __dirname,
  '../Chips-ComponentLibrary/packages/component-library/src',
);

export default defineConfig({
  /**
   * Electron 主进程配置
   */
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist-electron/main',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts'),
        },
      },
    },
  },

  /**
   * 预加载脚本配置
   */
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist-electron/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/preload/index.ts'),
        },
      },
    },
  },

  /**
   * 渲染进程配置（React 应用）
   */
  renderer: {
    root: resolve(__dirname, 'src/renderer'),
    plugins: [react()],
    server: {
      fs: {
        allow: [resolve(__dirname, '..')],
      },
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/renderer/index.html'),
      },
    },
    resolve: {
      alias: [
        /* 薯片组件库包名 → 源码入口 */
        {
          find: '@chips/components',
          replacement: resolve(componentLibrarySrc, 'index.ts'),
        },
        /* 模板应用自身路径别名 */
        {
          find: '@renderer',
          replacement: resolve(__dirname, 'src/renderer'),
        },
      ],
    },
  },
});
