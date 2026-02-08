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
        {{ appStore.locale === 'zh-CN' ? t('header.lang_zh') : t('header.lang_en') }}
      </button>

      <!-- 主题切换 -->
      <button
        class="header-btn"
        :title="isDark ? t('header.theme_light') : t('header.theme_dark')"
        @click="toggleTheme"
      >
        {{ isDark ? '☀' : '☾' }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 var(--chips-spacing-md);
  background-color: var(--chips-color-surface);
  border-bottom: 1px solid var(--chips-color-border);
  -webkit-app-region: drag;
  user-select: none;
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
  font-size: var(--chips-font-size-sm);
  font-weight: var(--chips-font-weight-medium);
  color: var(--chips-color-text);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--chips-spacing-xs);
  -webkit-app-region: no-drag;
}

.header-btn {
  padding: var(--chips-spacing-xs) var(--chips-spacing-sm);
  background: transparent;
  border: 1px solid var(--chips-color-border);
  border-radius: var(--chips-radius-sm);
  color: var(--chips-color-text-secondary);
  font-size: var(--chips-font-size-xs);
  cursor: pointer;
  transition: all var(--chips-duration-fast) var(--chips-easing-default);
}

.header-btn:hover {
  color: var(--chips-color-text);
  border-color: var(--chips-color-primary);
  background-color: var(--chips-color-surface);
}
</style>
