/**
 * SDK 服务
 * @module renderer/services/sdk-service
 * @description 初始化并管理 ChipsSDK 实例
 *
 * 遵循规范：
 * - 中心路由架构（设计原稿 15）：通过 CoreConnector 与内核通信
 * - 模块联动协作规范（生态共用 14）：应用层通过 SDK API 访问生态能力
 */

import { ChipsSDK, type ChipsSDKOptions, CoreConnector } from '@chips/sdk';

/** 内核 WebSocket 地址 */
const CORE_WS_URL = 'ws://127.0.0.1:9527';

/** SDK 单例 Promise */
let sdkPromise: Promise<ChipsSDK> | null = null;

/**
 * 创建 CoreConnector 实例
 * 开发模式使用本地连接器，生产模式使用 WebSocket 连接器
 */
function createConnector(): CoreConnector {
  return new CoreConnector({ url: CORE_WS_URL });
}

/**
 * 获取 SDK 实例（单例模式）
 * @returns ChipsSDK 实例
 */
export async function getAppSdk(): Promise<ChipsSDK> {
  if (!sdkPromise) {
    sdkPromise = (async () => {
      const connector = createConnector();
      const options: ChipsSDKOptions = {
        connectorInstance: connector,
        autoConnect: true, // 启用自动连接
        debug: true,
      };

      const sdk = new ChipsSDK(options);
      await sdk.initialize();

      console.log('[AppTemplate] SDK 初始化完成, 版本:', ChipsSDK.VERSION.sdk);
      return sdk;
    })();
  }

  return sdkPromise;
}

/**
 * 获取 SDK 同步引用（可能为 null）
 */
let _sdkInstance: ChipsSDK | null = null;

/**
 * 初始化并缓存 SDK 实例
 */
export async function initializeSdk(): Promise<ChipsSDK> {
  const sdk = await getAppSdk();
  _sdkInstance = sdk;
  return sdk;
}

/**
 * 获取已初始化的 SDK（同步访问）
 */
export function getSdkSync(): ChipsSDK | null {
  return _sdkInstance;
}
