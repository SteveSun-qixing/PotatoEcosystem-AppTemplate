/**
 * i18n 组合式函数
 * @module renderer/composables/use-i18n
 * @description 在 Vue 组件中访问 i18n 服务
 */

import { t, setLocale, getLocale } from '../services/i18n-service';
import { useAppStore } from '../stores/app-store';
import type { Locale } from '../types';

/**
 * 使用 i18n
 */
export function useI18n() {
  const appStore = useAppStore();

  /**
   * 切换语言
   */
  function switchLocale(locale: Locale): void {
    setLocale(locale);
    appStore.setLocale(locale);
  }

  /**
   * 切换到下一个语言
   */
  function toggleLocale(): void {
    const current = getLocale();
    const next: Locale = current === 'zh-CN' ? 'en-US' : 'zh-CN';
    switchLocale(next);
  }

  return {
    t,
    locale: appStore.locale,
    setLocale: switchLocale,
    toggleLocale,
  };
}
