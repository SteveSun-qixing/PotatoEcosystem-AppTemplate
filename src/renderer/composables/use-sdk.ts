/**
 * SDK 组合式函数
 * @module renderer/composables/use-sdk
 * @description 在 Vue 组件中访问 SDK
 */

import { getSdkSync } from '../services/sdk-service';
import { useAppStore } from '../stores/app-store';

/**
 * 使用 SDK
 */
export function useSdk() {
  const appStore = useAppStore();

  return {
    /** 获取 SDK 实例（可能为 null） */
    sdk: getSdkSync(),
    /** SDK 是否就绪 */
    isReady: appStore.sdkReady,
    /** 连接状态 */
    connectionState: appStore.connectionState,
  };
}
