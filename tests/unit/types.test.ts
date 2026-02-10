/**
 * 类型定义单元测试
 * @description 验证类型约束正确性
 */

import { describe, it, expect } from 'vitest';
import type { Locale, ThemeType, AppState, ConnectionState, TestResult } from '../../src/renderer/types';

describe('types', () => {
  it('should accept valid Locale values', () => {
    const zh: Locale = 'zh-CN';
    const en: Locale = 'en-US';
    expect(zh).toBe('zh-CN');
    expect(en).toBe('en-US');
  });

  it('should accept valid ThemeType values', () => {
    const light: ThemeType = 'default-light';
    const dark: ThemeType = 'default-dark';
    expect(light).toBe('default-light');
    expect(dark).toBe('default-dark');
  });

  it('should accept valid AppState values', () => {
    const states: AppState[] = ['loading', 'ready', 'error'];
    expect(states).toHaveLength(3);
  });

  it('should accept valid ConnectionState values', () => {
    const states: ConnectionState[] = ['disconnected', 'connecting', 'connected', 'error'];
    expect(states).toHaveLength(4);
  });

  it('should create valid TestResult', () => {
    const result: TestResult = {
      name: 'Test Name',
      passed: true,
      message: 'All good',
      duration: 42,
    };
    expect(result.name).toBe('Test Name');
    expect(result.passed).toBe(true);
    expect(result.duration).toBe(42);
  });
});
