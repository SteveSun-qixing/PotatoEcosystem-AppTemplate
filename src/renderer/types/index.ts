/**
 * 应用类型定义
 * @module renderer/types
 * @description 模板应用的核心类型定义
 */

/** 支持的语言代码 */
export type Locale = 'zh-CN' | 'en-US';

/** 支持的主题类型 */
export type ThemeType = 'default-light' | 'default-dark';

/** 应用状态 */
export type AppState = 'loading' | 'ready' | 'error';

/** SDK 连接状态 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/** 标准错误代码格式 [分类]-[编号] */
export interface ChipsErrorInfo {
  /** 错误代码 */
  code: string;
  /** 错误消息（i18n key） */
  messageKey: string;
  /** 附加详情 */
  details?: Record<string, unknown>;
}

/** 快捷键绑定配置 */
export interface KeyboardBinding {
  /** 快捷键标识 */
  id: string;
  /** Windows/Linux 快捷键 */
  key: string;
  /** macOS 快捷键 */
  macKey: string;
  /** 对应动作 */
  action: string;
}

/** 测试面板结果 */
export interface TestResult {
  /** 测试名称 */
  name: string;
  /** 是否通过 */
  passed: boolean;
  /** 详情消息 */
  message: string;
  /** 耗时（毫秒） */
  duration?: number;
}
