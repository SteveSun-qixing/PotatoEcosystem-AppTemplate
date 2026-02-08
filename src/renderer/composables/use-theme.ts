/**
 * 主题组合式函数
 * @module renderer/composables/use-theme
 * @description 在 Vue 组件中访问主题服务
 */

import { setTheme, getTheme, toggleTheme } from '../services/theme-service';
import { useAppStore } from '../stores/app-store';
import type { ThemeType } from '../types';

/**
 * 使用主题
 */
export function useTheme() {
  const appStore = useAppStore();

  /**
   * 切换主题
   */
  function switchTheme(themeId: ThemeType): void {
    setTheme(themeId);
    appStore.setTheme(themeId);
  }

  /**
   * 切换亮暗模式
   */
  function toggle(): void {
    const newTheme = toggleTheme();
    appStore.setTheme(newTheme);
  }

  return {
    theme: appStore.theme,
    isDark: appStore.isDark,
    setTheme: switchTheme,
    toggleTheme: toggle,
    getTheme,
  };
}
