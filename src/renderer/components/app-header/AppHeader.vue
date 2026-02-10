<script setup lang="ts">
/**
 * 应用头部
 * @description 标题栏、主题切换、语言切换
 *
 * 遵循规范：
 * - 多语言（生态共用 11）：所有文本通过 t() 获取
 * - 主题系统（设计原稿 12）：使用 CSS 变量
 */

import { computed } from 'vue';
import { t } from '../../services/i18n-service';
import { useAppStore } from '../../stores/app-store';
import { useTheme } from '../../composables/use-theme';
import { useI18n } from '../../composables/use-i18n';

const appStore = useAppStore();
const { isDark, toggleTheme } = useTheme();
const { toggleLocale } = useI18n();

const isMac = computed(() => {
  return typeof window !== 'undefined' && window.electronAPI?.platform === 'darwin';
});
</script>

<template>
  <header class="app-header" :class="{ 'is-mac': isMac }">
    <!-- macOS traffic light 留空区 -->
    <div v-if="isMac" class="traffic-light-spacer"></div>

    <!-- 标题 -->
    <div class="header-title">
      <h1 class="title-text">{{ t('app.title') }}</h1>
    </div>

    <!-- 右侧操作 -->
    <div class="header-actions">
      <!-- 语言切换 -->
      <button class="header-btn" :title="t('header.lang_zh')" @click="toggleLocale">
        <span class="btn-icon">🌐</span>
        <span class="btn-text">{{ appStore.locale === 'zh-CN' ? t('header.lang_zh') : t('header.lang_en') }}</span>
      </button>

      <!-- 主题切换 -->
      <button
        class="header-btn theme-btn"
        :title="isDark ? t('header.theme_light') : t('header.theme_dark')"
        @click="toggleTheme"
      >
        <span class="btn-icon theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 var(--chips-spacing-lg, 20px);
  background-color: var(--chips-color-surface, #f8fafc);
  border-bottom: 1px solid var(--chips-color-border, #e2e8f0);
  -webkit-app-region: drag;
  user-select: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.app-header.is-mac {
  padding-left: 80px;
}

.traffic-light-spacer {
  width: 0;
}

.header-title {
  flex: 1;
}

.title-text {
  font-size: var(--chips-font-size-base, 0.95rem);
  font-weight: var(--chips-font-weight-semibold, 600);
  color: var(--chips-color-text, #1e293b);
  letter-spacing: -0.01em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--chips-spacing-sm, 10px);
  -webkit-app-region: no-drag;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: var(--chips-spacing-xs, 6px);
  padding: var(--chips-spacing-xs, 7px) var(--chips-spacing-md, 14px);
  background: var(--chips-color-background, #ffffff);
  border: 1.5px solid var(--chips-color-border, #e2e8f0);
  border-radius: var(--chips-radius-md, 8px);
  color: var(--chips-color-text-secondary, #64748b);
  font-size: var(--chips-font-size-xs, 0.8rem);
  font-weight: var(--chips-font-weight-medium, 500);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-btn:hover {
  color: var(--chips-color-text, #1e293b);
  border-color: var(--chips-color-primary, #3b82f6);
  background-color: rgba(59, 130, 246, 0.04);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
}

.header-btn:active {
  transform: translateY(0);
}

.header-btn.theme-btn {
  padding: var(--chips-spacing-xs, 7px);
  width: 36px;
  justify-content: center;
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  line-height: 1;
}
</style>
