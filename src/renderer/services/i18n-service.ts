/**
 * 多语言服务
 * @module renderer/services/i18n-service
 * @description 管理应用的多语言翻译
 *
 * 遵循规范：
 * - 多语言系统规范（生态共用 11）：零硬编码，所有文本通过 t() 获取
 * - 开发阶段使用 key，打包时自动替换为系统编码
 */

import type { ChipsSDK } from '@chips/sdk';
import { initializeSdk } from './sdk-service';
import type { Locale } from '../types';

/** 翻译表类型 */
type TranslationTable = Record<string, unknown>;

/** 默认语言 */
const DEFAULT_LOCALE: Locale = 'zh-CN';
const FALLBACK_LOCALE: Locale = 'en-US';

/** 本地翻译表缓存 */
let localTranslations: Record<string, TranslationTable> = {};

/** 当前语言 */
let currentLocale: Locale = DEFAULT_LOCALE;

/** SDK 实例引用 */
let sdkInstance: ChipsSDK | null = null;

/**
 * 加载本地翻译文件
 */
async function loadLocalTranslations(): Promise<void> {
  try {
    const yamlModule = await import('js-yaml');
    const yamlContent = await import('../i18n/dev_i18n.yaml?raw');
    const parsed = yamlModule.load(yamlContent.default) as Record<string, TranslationTable>;

    if (parsed) {
      localTranslations = parsed;
    }
  } catch (error) {
    console.warn('[i18n] 加载本地翻译文件失败，使用内置翻译:', error);
    localTranslations = {};
  }
}

/**
 * 从翻译表中按 key 解析值
 */
function resolveValue(table: TranslationTable, key: string): string | null {
  const segments = key.split('.');
  let current: unknown = table;

  for (const segment of segments) {
    if (!current || typeof current !== 'object') return null;
    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === 'string' ? current : null;
}

/**
 * 变量插值
 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

/**
 * 获取本地翻译
 */
function getLocalTranslation(key: string, params?: Record<string, string | number>): string | null {
  // 尝试当前语言
  const table = localTranslations[currentLocale];
  if (table) {
    const value = resolveValue(table, key);
    if (value) return interpolate(value, params);
  }

  // 回退语言
  const fallbackTable = localTranslations[FALLBACK_LOCALE];
  if (fallbackTable) {
    const value = resolveValue(fallbackTable, key);
    if (value) return interpolate(value, params);
  }

  return null;
}

/**
 * 初始化 i18n 服务
 * @param locale - 初始语言
 */
export async function initializeI18n(locale?: Locale): Promise<void> {
  // 加载本地翻译文件
  await loadLocalTranslations();

  // 获取 SDK 实例并注册翻译
  const sdk = await initializeSdk();
  sdkInstance = sdk;

  // 向 SDK I18nManager 注册本地翻译
  for (const [lang, table] of Object.entries(localTranslations)) {
    sdk.i18n.addTranslation(lang, table);
  }

  // 设置语言
  currentLocale = locale || DEFAULT_LOCALE;
  sdk.setLocale(currentLocale);

  console.log('[i18n] 多语言服务初始化完成, 语言:', currentLocale);
}

/**
 * 翻译文本
 * 遵循零硬编码原则：所有文本通过此函数获取
 *
 * @param key - 翻译 key（如 'app.title'）
 * @param params - 插值参数
 * @returns 翻译后的文本
 */
export function t(key: string, params?: Record<string, string | number>): string {
  // 优先通过 SDK 翻译
  if (sdkInstance) {
    const translated = sdkInstance.t(key, params);
    if (translated !== key) return translated;
  }

  // 回退到本地翻译
  return getLocalTranslation(key, params) ?? key;
}

/**
 * 切换语言
 */
export function setLocale(locale: Locale): void {
  currentLocale = locale;
  if (sdkInstance) {
    sdkInstance.setLocale(locale);
  }
  console.log('[i18n] 语言已切换:', locale);
}

/**
 * 获取当前语言
 */
export function getLocale(): Locale {
  return currentLocale;
}
