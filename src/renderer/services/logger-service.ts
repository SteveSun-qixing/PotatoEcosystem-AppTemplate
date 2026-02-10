/**
 * 日志服务
 * @module renderer/services/logger-service
 * @description 应用日志记录服务
 *
 * 遵循规范：
 * - 日志记录规范（开发规范 5）：结构化日志，按级别分类
 */

import { getSdkSync } from './sdk-service';

/** 日志级别 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * 创建日志记录器
 * @param module - 模块名称
 */
export function createLogger(module: string) {
  function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${module}]`;

    // 尝试通过 SDK Logger 记录
    const sdk = getSdkSync();
    if (sdk) {
      const logger = sdk.logger;
      switch (level) {
        case 'debug':
          logger.debug(`${prefix} ${message}`, data);
          break;
        case 'info':
          logger.info(`${prefix} ${message}`, data);
          break;
        case 'warn':
          logger.warn(`${prefix} ${message}`, data);
          break;
        case 'error':
          logger.error(`${prefix} ${message}`, data);
          break;
      }
      return;
    }

    // 降级：直接使用 console
    const logData = { timestamp, module, ...data };
    switch (level) {
      case 'debug':
        console.debug(prefix, message, logData);
        break;
      case 'info':
        console.info(prefix, message, logData);
        break;
      case 'warn':
        console.warn(prefix, message, logData);
        break;
      case 'error':
        console.error(prefix, message, logData);
        break;
    }
  }

  return {
    debug: (message: string, data?: Record<string, unknown>) => log('debug', message, data),
    info: (message: string, data?: Record<string, unknown>) => log('info', message, data),
    warn: (message: string, data?: Record<string, unknown>) => log('warn', message, data),
    error: (message: string, data?: Record<string, unknown>) => log('error', message, data),
  };
}

/** 应用根日志器 */
export const appLogger = createLogger('AppTemplate');
