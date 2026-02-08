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
  height: 28px;
  padding: 0 var(--chips-spacing-md);
  background-color: var(--chips-color-surface);
  border-top: 1px solid var(--chips-color-border);
  gap: var(--chips-spacing-lg);
  font-size: var(--chips-font-size-xs);
  user-select: none;
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--chips-spacing-xs);
}

.status-label {
  color: var(--chips-color-text-secondary);
}

.status-value {
  color: var(--chips-color-text);
}

.status-value.success {
  color: var(--chips-color-success);
}
</style>
