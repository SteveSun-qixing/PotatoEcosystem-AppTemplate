<script setup lang="ts">
/**
 * Chips AppTemplate - 根组件
 * @module App
 * @description 薯片生态标准模板应用入口
 *
 * 遵循规范：
 * - 多语言（生态共用 11）：所有文本通过 t() 获取
 * - 主题系统（设计原稿 12）：使用 CSS 变量，零硬编码样式
 * - 组件库集成：使用 ChipsProvider + ThemeProvider 包裹
 */

import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ChipsProvider, ThemeProvider } from '@chips/components';
import { useAppStore } from './stores/app-store';
import { initializeI18n, t } from './services/i18n-service';
import { initializeTheme } from './services/theme-service';
import {
  initializeKeyboard,
  destroyKeyboard,
  registerStandardShortcuts,
} from './services/keyboard-service';
import { appLogger } from './services/logger-service';
import AppHeader from './components/app-header/AppHeader.vue';
import StatusBar from './components/status-bar/StatusBar.vue';
import SdkTestPanel from './components/test-panels/SdkTestPanel.vue';
import I18nTestPanel from './components/test-panels/I18nTestPanel.vue';
import ThemeTestPanel from './components/test-panels/ThemeTestPanel.vue';
import EventTestPanel from './components/test-panels/EventTestPanel.vue';
import CoreTestPanel from './components/test-panels/CoreTestPanel.vue';

const appStore = useAppStore();

/** 应用是否就绪 */
const isReady = computed(() => appStore.isReady);
const errorMessage = computed(() => appStore.errorMessage);
const locale = computed(() => appStore.locale);
const theme = computed(() => appStore.theme);

/** 活动测试面板 */
const activePanel = ref<string>('sdk');

/**
 * 切换活动测试面板
 */
function setActivePanel(panel: string): void {
  activePanel.value = panel;
}

/**
 * 初始化应用
 */
onMounted(async () => {
  try {
    appLogger.info('initializing application');

    // 1. 初始化 i18n
    await initializeI18n(appStore.locale);
    appStore.setSdkReady(true);

    // 2. 初始化主题
    initializeTheme();

    // 3. 初始化快捷键
    initializeKeyboard();
    registerStandardShortcuts({
      onToggleTheme: () => {
        import('./composables/use-theme').then(({ useTheme: useThemeFn }) => {
          const { toggleTheme: toggle } = useThemeFn();
          toggle();
        });
      },
    });

    // 4. 监听菜单事件
    if (window.electronAPI?.onMenuAction) {
      window.electronAPI.onMenuAction((action: string) => {
        appLogger.info('menu action received', { action });
      });
    }

    // 5. 设置就绪
    appStore.setState('ready');
    appLogger.info('application initialized successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : t('app.error_unknown');
    appStore.setError(message);
    appLogger.error('initialization failed', { error: String(error) });
  }
});

onUnmounted(() => {
  destroyKeyboard();
});

/**
 * 重试初始化
 */
function handleRetry(): void {
  appStore.setState('loading');
  appStore.setError(null);
  globalThis.location.reload();
}
</script>

<template>
  <ThemeProvider :theme="theme">
    <ChipsProvider :locale="locale" :theme="theme">
      <div class="app-container">
        <!-- 加载状态 -->
        <div v-if="!isReady && !errorMessage" class="app-loading">
          <div class="loading-spinner"></div>
          <p class="loading-text">{{ t('app.loading') }}</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="errorMessage" class="app-error">
          <p class="error-title">{{ t('app.error_title') }}</p>
          <p class="error-message">{{ errorMessage }}</p>
          <button class="error-retry-btn" @click="handleRetry">
            {{ t('app.error_retry') }}
          </button>
        </div>

        <!-- 应用主体 -->
        <template v-else>
          <AppHeader />

          <main class="app-main">
            <!-- 测试面板导航 -->
            <nav class="test-nav">
              <h2 class="test-nav-title">{{ t('test.title') }}</h2>
              <div class="test-nav-tabs">
                <button
                  v-for="panel in ['sdk', 'i18n', 'theme', 'event', 'core']"
                  :key="panel"
                  class="test-nav-tab"
                  :class="{ active: activePanel === panel }"
                  @click="setActivePanel(panel)"
                >
                  {{ t(`test.${panel}.title`) }}
                </button>
              </div>
            </nav>

            <!-- 测试面板内容 -->
            <div class="test-content">
              <SdkTestPanel v-if="activePanel === 'sdk'" />
              <I18nTestPanel v-else-if="activePanel === 'i18n'" />
              <ThemeTestPanel v-else-if="activePanel === 'theme'" />
              <EventTestPanel v-else-if="activePanel === 'event'" />
              <CoreTestPanel v-else-if="activePanel === 'core'" />
            </div>
          </main>

          <StatusBar />
        </template>
      </div>
    </ChipsProvider>
  </ThemeProvider>
</template>

<style>
/* 全局重置 - 使用 CSS 变量（主题系统规范） */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family: var(--chips-font-family, system-ui, -apple-system, sans-serif);
  font-size: var(--chips-font-size-base, 1rem);
  color: var(--chips-color-text, #1e293b);
  background-color: var(--chips-color-background, #ffffff);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%;
}
</style>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--chips-color-background);
  color: var(--chips-color-text);
}

/* 加载状态 */
.app-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--chips-spacing-md);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--chips-color-border);
  border-top-color: var(--chips-color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: var(--chips-color-text-secondary);
  font-size: var(--chips-font-size-sm);
}

/* 错误状态 */
.app-error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--chips-spacing-sm);
  padding: var(--chips-spacing-xl);
}

.error-title {
  color: var(--chips-color-error);
  font-size: var(--chips-font-size-lg);
  font-weight: var(--chips-font-weight-semibold);
}

.error-message {
  color: var(--chips-color-text-secondary);
  text-align: center;
  max-width: 400px;
}

.error-retry-btn {
  margin-top: var(--chips-spacing-md);
  padding: var(--chips-spacing-sm) var(--chips-spacing-lg);
  background-color: var(--chips-color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--chips-radius-md);
  font-weight: var(--chips-font-weight-medium);
  cursor: pointer;
  transition: opacity var(--chips-duration-fast) var(--chips-easing-default);
}

.error-retry-btn:hover {
  opacity: 0.9;
}

/* 主体 */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: var(--chips-spacing-lg);
  gap: var(--chips-spacing-md);
}

/* 测试导航 */
.test-nav {
  display: flex;
  flex-direction: column;
  gap: var(--chips-spacing-sm);
}

.test-nav-title {
  font-size: var(--chips-font-size-lg);
  font-weight: var(--chips-font-weight-semibold);
  color: var(--chips-color-text);
}

.test-nav-tabs {
  display: flex;
  gap: var(--chips-spacing-xs);
  border-bottom: 1px solid var(--chips-color-border);
  padding-bottom: var(--chips-spacing-sm);
}

.test-nav-tab {
  padding: var(--chips-spacing-xs) var(--chips-spacing-md);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--chips-radius-sm);
  color: var(--chips-color-text-secondary);
  font-size: var(--chips-font-size-sm);
  cursor: pointer;
  transition: all var(--chips-duration-fast) var(--chips-easing-default);
}

.test-nav-tab:hover {
  color: var(--chips-color-text);
  background-color: var(--chips-color-surface);
}

.test-nav-tab.active {
  color: var(--chips-color-primary);
  border-color: var(--chips-color-primary);
  background-color: var(--chips-color-surface);
}

/* 测试内容 */
.test-content {
  flex: 1;
  overflow-y: auto;
}
</style>
