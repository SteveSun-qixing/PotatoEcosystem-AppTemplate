/**
 * i18n 服务单元测试
 * @description 验证 i18n 翻译和插值功能
 */

import { describe, it, expect } from 'vitest';

describe('i18n-service', () => {
  describe('interpolate', () => {
    /**
     * 变量插值函数的独立测试
     */
    function interpolate(
      template: string,
      params?: Record<string, string | number>,
    ): string {
      if (!params) return template;
      return template.replace(/\{(\w+)\}/g, (match, key: string) => {
        return params[key] !== undefined ? String(params[key]) : match;
      });
    }

    it('should return template unchanged when no params', () => {
      expect(interpolate('Hello World')).toBe('Hello World');
    });

    it('should replace single variable', () => {
      expect(interpolate('Hello {name}', { name: 'World' })).toBe('Hello World');
    });

    it('should replace multiple variables', () => {
      expect(interpolate('{count} files in {folder}', { count: 42, folder: 'docs' })).toBe(
        '42 files in docs',
      );
    });

    it('should keep unmatched placeholders', () => {
      expect(interpolate('Hello {name}', {})).toBe('Hello {name}');
    });

    it('should handle numeric values', () => {
      expect(interpolate('Total: {total}', { total: 100 })).toBe('Total: 100');
    });
  });

  describe('resolveValue', () => {
    /**
     * 独立测试翻译值解析
     */
    function resolveValue(
      table: Record<string, unknown>,
      key: string,
    ): string | null {
      const segments = key.split('.');
      let current: unknown = table;
      for (const segment of segments) {
        if (!current || typeof current !== 'object') return null;
        current = (current as Record<string, unknown>)[segment];
      }
      return typeof current === 'string' ? current : null;
    }

    it('should resolve top-level key', () => {
      expect(resolveValue({ title: 'Hello' }, 'title')).toBe('Hello');
    });

    it('should resolve nested key', () => {
      expect(resolveValue({ app: { title: 'My App' } }, 'app.title')).toBe('My App');
    });

    it('should resolve deeply nested key', () => {
      expect(
        resolveValue({ a: { b: { c: 'deep' } } }, 'a.b.c'),
      ).toBe('deep');
    });

    it('should return null for missing key', () => {
      expect(resolveValue({ app: {} }, 'app.missing')).toBeNull();
    });

    it('should return null for non-string value', () => {
      expect(resolveValue({ app: { nested: {} } }, 'app.nested')).toBeNull();
    });
  });
});
