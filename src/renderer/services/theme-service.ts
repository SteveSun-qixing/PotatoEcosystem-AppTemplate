/**
 * 主题服务
 * @module renderer/services/theme-service
 * @description 管理应用主题切换和 CSS 变量注入
 *
 * 遵循规范：
 * - 主题系统（设计原稿 12、33）：组件不硬编码样式，使用 CSS 变量
 * - 全局主题管理系统：通过 SDK ThemeManager 管理
 */

import { getSdkSync } from './sdk-service';
import type { ThemeType } from '../types';

/** 当前主题 ID */
let currentThemeId: ThemeType = 'default-light';

/**
 * 初始化主题服务
 */
export function initializeTheme(): void {
  const sdk = getSdkSync();
  if (!sdk) {
    console.warn('[Theme] SDK 未就绪，使用默认主题');
    applyThemeToDOM(currentThemeId);
    return;
  }

  // 检测系统主题偏好
  const systemPreference = sdk.themes.detectSystemTheme();
  currentThemeId = systemPreference === 'dark' ? 'default-dark' : 'default-light';

  // 设置并应用主题
  sdk.themes.setTheme(currentThemeId);
  sdk.themes.applyToDOM(document.documentElement);

  console.log('[Theme] 主题服务初始化完成, 主题:', currentThemeId);
}

/**
 * 切换主题
 */
export function setTheme(themeId: ThemeType): void {
  currentThemeId = themeId;

  const sdk = getSdkSync();
  if (sdk) {
    sdk.themes.setTheme(themeId);
    sdk.themes.applyToDOM(document.documentElement);
  } else {
    applyThemeToDOM(themeId);
  }

  console.log('[Theme] 主题已切换:', themeId);
}

/**
 * 获取当前主题 ID
 */
export function getTheme(): ThemeType {
  return currentThemeId;
}

/**
 * 切换亮暗主题
 */
export function toggleTheme(): ThemeType {
  const newTheme: ThemeType =
    currentThemeId === 'default-light' ? 'default-dark' : 'default-light';
  setTheme(newTheme);
  return newTheme;
}

/**
 * 无 SDK 时的降级主题应用
 * 使用内置的 CSS 变量定义
 */
function applyThemeToDOM(themeId: ThemeType): void {
  const root = document.documentElement;
  const isDark = themeId === 'default-dark';

  root.setAttribute('data-theme', isDark ? 'dark' : 'light');

  // 基础 CSS 变量（降级模式）
  const vars: Record<string, string> = isDark
    ? {
        '--chips-color-primary': '#60a5fa',
        '--chips-color-secondary': '#818cf8',
        '--chips-color-background': '#0f172a',
        '--chips-color-surface': '#1e293b',
        '--chips-color-text': '#f1f5f9',
        '--chips-color-text-secondary': '#94a3b8',
        '--chips-color-border': '#334155',
        '--chips-color-error': '#f87171',
        '--chips-color-success': '#4ade80',
        '--chips-color-warning': '#fbbf24',
      }
    : {
        '--chips-color-primary': '#3b82f6',
        '--chips-color-secondary': '#6366f1',
        '--chips-color-background': '#ffffff',
        '--chips-color-surface': '#f8fafc',
        '--chips-color-text': '#1e293b',
        '--chips-color-text-secondary': '#64748b',
        '--chips-color-border': '#e2e8f0',
        '--chips-color-error': '#ef4444',
        '--chips-color-success': '#22c55e',
        '--chips-color-warning': '#f59e0b',
      };

  // 通用变量
  const commonVars: Record<string, string> = {
    '--chips-spacing-xs': '0.25rem',
    '--chips-spacing-sm': '0.5rem',
    '--chips-spacing-md': '1rem',
    '--chips-spacing-lg': '1.5rem',
    '--chips-spacing-xl': '2rem',
    '--chips-radius-sm': '0.25rem',
    '--chips-radius-md': '0.5rem',
    '--chips-radius-lg': '0.75rem',
    '--chips-shadow-sm': isDark
      ? '0 1px 2px 0 rgb(0 0 0 / 0.2)'
      : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '--chips-shadow-md': isDark
      ? '0 4px 6px -1px rgb(0 0 0 / 0.3)'
      : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    '--chips-font-family': 'system-ui, -apple-system, sans-serif',
    '--chips-font-size-xs': '0.75rem',
    '--chips-font-size-sm': '0.875rem',
    '--chips-font-size-base': '1rem',
    '--chips-font-size-lg': '1.125rem',
    '--chips-font-weight-normal': '400',
    '--chips-font-weight-medium': '500',
    '--chips-font-weight-semibold': '600',
    '--chips-duration-fast': '100ms',
    '--chips-duration-normal': '200ms',
    '--chips-easing-default': 'ease',
  };

  for (const [key, value] of Object.entries({ ...vars, ...commonVars })) {
    root.style.setProperty(key, value);
  }
}
