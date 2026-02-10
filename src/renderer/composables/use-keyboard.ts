/**
 * 快捷键组合式函数
 * @module renderer/composables/use-keyboard
 * @description 在 Vue 组件中注册快捷键
 */

import { onMounted, onUnmounted } from 'vue';
import { registerShortcut, unregisterShortcut } from '../services/keyboard-service';

/**
 * 使用快捷键
 * @param key - 快捷键字符串
 * @param handler - 处理函数
 */
export function useKeyboard(key: string, handler: () => void): void {
  onMounted(() => {
    registerShortcut(key, handler);
  });

  onUnmounted(() => {
    unregisterShortcut(key);
  });
}
