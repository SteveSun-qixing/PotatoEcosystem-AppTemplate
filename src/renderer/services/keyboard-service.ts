/**
 * 快捷键服务
 * @module renderer/services/keyboard-service
 * @description 管理应用快捷键绑定
 *
 * 遵循规范：
 * - 快捷键规范（开发规范 9）：标准快捷键，支持自定义
 */

/** 快捷键处理器类型 */
type KeyHandler = () => void;

/** 已注册的快捷键绑定 */
const bindings = new Map<string, KeyHandler>();

/** 是否为 macOS */
const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');

/**
 * 标准化按键字符串
 */
function normalizeKey(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.ctrlKey || event.metaKey) parts.push(isMac ? 'Cmd' : 'Ctrl');
  if (event.shiftKey) parts.push('Shift');
  if (event.altKey) parts.push('Alt');

  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
  parts.push(key);

  return parts.join('+');
}

/**
 * 全局键盘事件处理
 */
function handleKeyDown(event: KeyboardEvent): void {
  const normalized = normalizeKey(event);
  const handler = bindings.get(normalized);

  if (handler) {
    event.preventDefault();
    event.stopPropagation();
    handler();
  }
}

/**
 * 初始化快捷键服务
 */
export function initializeKeyboard(): void {
  window.addEventListener('keydown', handleKeyDown);
  console.log('[Keyboard] 快捷键服务初始化完成');
}

/**
 * 销毁快捷键服务
 */
export function destroyKeyboard(): void {
  window.removeEventListener('keydown', handleKeyDown);
  bindings.clear();
}

/**
 * 注册快捷键
 * @param key - 快捷键字符串（如 'Ctrl+S'）
 * @param handler - 处理函数
 */
export function registerShortcut(key: string, handler: KeyHandler): void {
  bindings.set(key, handler);
}

/**
 * 注销快捷键
 */
export function unregisterShortcut(key: string): void {
  bindings.delete(key);
}

/**
 * 注册标准快捷键
 */
export function registerStandardShortcuts(handlers: {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onFind?: () => void;
  onToggleTheme?: () => void;
  onToggleLocale?: () => void;
}): void {
  const mod = isMac ? 'Cmd' : 'Ctrl';

  if (handlers.onSave) registerShortcut(`${mod}+S`, handlers.onSave);
  if (handlers.onUndo) registerShortcut(`${mod}+Z`, handlers.onUndo);
  if (handlers.onRedo) registerShortcut(`${mod}+Shift+Z`, handlers.onRedo);
  if (handlers.onFind) registerShortcut(`${mod}+F`, handlers.onFind);
  if (handlers.onToggleTheme) registerShortcut(`${mod}+Shift+T`, handlers.onToggleTheme);
  if (handlers.onToggleLocale) registerShortcut(`${mod}+Shift+L`, handlers.onToggleLocale);
}
