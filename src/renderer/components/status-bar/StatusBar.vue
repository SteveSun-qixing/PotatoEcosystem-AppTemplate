<script setup lang="ts">
/**
 * 状态栏
 * @description 显示 SDK 状态、连接状态、当前语言、当前主题
 *
 * 遵循规范：
 * - 多语言（生态共用 11）：所有文本通过 t() 获取
 * - 主题系统（设计原稿 12）：使用 CSS 变量
 */

import { computed } from 'vue';
import { t } from '../../services/i18n-service';
import { useAppStore } from '../../stores/app-store';

const appStore = useAppStore();

const sdkStateText = computed(() => {
  return appStore.sdkReady ? t('status.ready') : t('status.loading');
});

const connectionText = computed(() => {
  const key = `status.${appStore.connectionState}`;
  return t(key);
});
</script>

<template>
  <footer class="status-bar">
    <div class="status-item">
      <span class="status-label">{{ t('status.sdk_state') }}:</span>
      <span class="status-value" :class="{ success: appStore.sdkReady }">
        {{ sdkStateText }}
      </span>
    </div>

    <div class="status-item">
      <span class="status-label">{{ t('status.connection') }}:</span>
      <span class="status-value">{{ connectionText }}</span>
    </div>

    <div class="status-item">
      <span class="status-label">{{ t('status.locale') }}:</span>
      <span class="status-value">{{ appStore.locale }}</span>
    </div>

    <div class="status-item">
      <span class="status-label">{{ t('status.theme') }}:</span>
      <span class="status-value">{{ appStore.theme }}</span>
    </div>
  </footer>
</template>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 var(--chips-spacing-lg, 20px);
  background-color: var(--chips-color-surface, #f8fafc);
  border-top: 1px solid var(--chips-color-border, #e2e8f0);
  gap: var(--chips-spacing-xl, 28px);
  font-size: var(--chips-font-size-xs, 0.75rem);
  user-select: none;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.03);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--chips-spacing-xs, 6px);
}

.status-label {
  color: var(--chips-color-text-secondary, #64748b);
  font-weight: var(--chips-font-weight-medium, 500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-value {
  color: var(--chips-color-text, #1e293b);
  font-weight: var(--chips-font-weight-medium, 500);
  padding: 2px var(--chips-spacing-xs, 6px);
  border-radius: var(--chips-radius-sm, 4px);
  background-color: var(--chips-color-background, #ffffff);
  border: 1px solid var(--chips-color-border, #e2e8f0);
}

.status-value.success {
  color: #10b981;
  border-color: #10b981;
  background-color: rgba(16, 185, 129, 0.06);
}
</style>
