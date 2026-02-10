/**
 * 应用全局状态
 * @module renderer/stores/app-store
 * @description Pinia 状态管理 - 应用全局状态
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AppState, Locale, ThemeType, ConnectionState } from '../types';

export const useAppStore = defineStore('app', () => {
  /** 应用状态 */
  const state = ref<AppState>('loading');

  /** 当前语言 */
  const locale = ref<Locale>('zh-CN');

  /** 当前主题 */
  const theme = ref<ThemeType>('default-light');

  /** SDK 连接状态 */
  const connectionState = ref<ConnectionState>('disconnected');

  /** SDK 是否就绪 */
  const sdkReady = ref(false);

  /** 错误消息 */
  const errorMessage = ref<string | null>(null);

  /** 是否暗色主题 */
  const isDark = computed(() => theme.value === 'default-dark');

  /** 应用是否就绪 */
  const isReady = computed(() => state.value === 'ready');

  /** 设置应用状态 */
  function setState(newState: AppState): void {
    state.value = newState;
  }

  /** 设置语言 */
  function setLocale(newLocale: Locale): void {
    locale.value = newLocale;
  }

  /** 设置主题 */
  function setTheme(newTheme: ThemeType): void {
    theme.value = newTheme;
  }

  /** 设置连接状态 */
  function setConnectionState(newState: ConnectionState): void {
    connectionState.value = newState;
  }

  /** 设置 SDK 就绪状态 */
  function setSdkReady(ready: boolean): void {
    sdkReady.value = ready;
  }

  /** 设置错误消息 */
  function setError(message: string | null): void {
    errorMessage.value = message;
    if (message) {
      state.value = 'error';
    }
  }

  return {
    state,
    locale,
    theme,
    connectionState,
    sdkReady,
    errorMessage,
    isDark,
    isReady,
    setState,
    setLocale,
    setTheme,
    setConnectionState,
    setSdkReady,
    setError,
  };
});
