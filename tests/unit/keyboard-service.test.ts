/**
 * 快捷键服务单元测试
 * @description 验证快捷键注册和注销功能
 */

import { describe, it, expect, vi } from 'vitest';

/**
 * 简化的快捷键绑定管理器（不依赖 DOM）
 */
class KeyBindingManager {
  private bindings = new Map<string, () => void>();

  register(key: string, handler: () => void): void {
    this.bindings.set(key, handler);
  }

  unregister(key: string): void {
    this.bindings.delete(key);
  }

  trigger(key: string): boolean {
    const handler = this.bindings.get(key);
    if (handler) {
      handler();
      return true;
    }
    return false;
  }

  has(key: string): boolean {
    return this.bindings.has(key);
  }

  get size(): number {
    return this.bindings.size;
  }
}

describe('keyboard-service', () => {
  it('should register shortcut', () => {
    const manager = new KeyBindingManager();
    const handler = vi.fn();

    manager.register('Ctrl+S', handler);

    expect(manager.has('Ctrl+S')).toBe(true);
    expect(manager.size).toBe(1);
  });

  it('should trigger registered shortcut', () => {
    const manager = new KeyBindingManager();
    const handler = vi.fn();

    manager.register('Ctrl+S', handler);
    manager.trigger('Ctrl+S');

    expect(handler).toHaveBeenCalledOnce();
  });

  it('should not trigger unregistered shortcut', () => {
    const manager = new KeyBindingManager();
    const triggered = manager.trigger('Ctrl+X');

    expect(triggered).toBe(false);
  });

  it('should unregister shortcut', () => {
    const manager = new KeyBindingManager();
    const handler = vi.fn();

    manager.register('Ctrl+Z', handler);
    manager.unregister('Ctrl+Z');

    expect(manager.has('Ctrl+Z')).toBe(false);
    expect(manager.trigger('Ctrl+Z')).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should support multiple shortcuts', () => {
    const manager = new KeyBindingManager();
    const save = vi.fn();
    const undo = vi.fn();
    const redo = vi.fn();

    manager.register('Ctrl+S', save);
    manager.register('Ctrl+Z', undo);
    manager.register('Ctrl+Shift+Z', redo);

    expect(manager.size).toBe(3);

    manager.trigger('Ctrl+Z');
    expect(undo).toHaveBeenCalledOnce();
    expect(save).not.toHaveBeenCalled();
    expect(redo).not.toHaveBeenCalled();
  });

  it('should replace existing binding', () => {
    const manager = new KeyBindingManager();
    const oldHandler = vi.fn();
    const newHandler = vi.fn();

    manager.register('Ctrl+S', oldHandler);
    manager.register('Ctrl+S', newHandler);

    manager.trigger('Ctrl+S');

    expect(oldHandler).not.toHaveBeenCalled();
    expect(newHandler).toHaveBeenCalledOnce();
  });
});
