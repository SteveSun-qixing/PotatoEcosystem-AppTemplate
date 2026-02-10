<script setup lang="ts">
/**
 * 主题测试面板
 * @description 验证主题切换、CSS 变量注入、亮暗模式
 */

import { ref, onMounted, watch } from 'vue';
import { t } from '../../services/i18n-service';
import { getSdkSync } from '../../services/sdk-service';
import { setTheme, getTheme } from '../../services/theme-service';
import { useAppStore } from '../../stores/app-store';
import type { TestResult } from '../../types';

const appStore = useAppStore();
const results = ref<TestResult[]>([]);
const running = ref(false);
const palette = ref<{ key: string; label: string; value: string }[]>([]);

function refreshPalette(): void {
  const root = document.documentElement;
  palette.value = [
    { key: '--chips-color-primary', label: 'primary', value: getComputedStyle(root).getPropertyValue('--chips-color-primary').trim() },
    { key: '--chips-color-background', label: 'background', value: getComputedStyle(root).getPropertyValue('--chips-color-background').trim() },
    { key: '--chips-color-surface', label: 'surface', value: getComputedStyle(root).getPropertyValue('--chips-color-surface').trim() },
    { key: '--chips-color-border', label: 'border', value: getComputedStyle(root).getPropertyValue('--chips-color-border').trim() },
    { key: '--chips-color-text', label: 'text', value: getComputedStyle(root).getPropertyValue('--chips-color-text').trim() },
  ];
}

function toggleThemePreview(): void {
  const next = appStore.theme === 'default-dark' ? 'default-light' : 'default-dark';
  setTheme(next);
  appStore.setTheme(next);
  refreshPalette();
}

async function runTests(): Promise<void> {
  running.value = true;
  results.value = [];

  results.value.push(testSwitch());
  results.value.push(testCSSVars());
  results.value.push(testList());
  results.value.push(testDetect());

  running.value = false;
  refreshPalette();
}

onMounted(() => {
  refreshPalette();
});

watch(
  () => appStore.theme,
  () => {
    refreshPalette();
  },
);

function testSwitch(): TestResult {
  const start = performance.now();
  const originalTheme = getTheme();

  // 切换到暗色
  setTheme('default-dark');
  appStore.setTheme('default-dark');
  const darkAttr = document.documentElement.getAttribute('data-theme');

  // 切换回亮色
  setTheme('default-light');
  appStore.setTheme('default-light');
  const lightAttr = document.documentElement.getAttribute('data-theme');

  // 恢复原始主题
  setTheme(originalTheme);
  appStore.setTheme(originalTheme);

  const passed = darkAttr === 'dark' && lightAttr === 'light';
  return {
    name: t('test.theme.test_switch'),
    passed,
    message: `dark: data-theme="${darkAttr}", light: data-theme="${lightAttr}"`,
    duration: Math.round(performance.now() - start),
  };
}

function testCSSVars(): TestResult {
  const start = performance.now();
  const root = document.documentElement;
  const primary = getComputedStyle(root).getPropertyValue('--chips-color-primary').trim();
  const bg = getComputedStyle(root).getPropertyValue('--chips-color-background').trim();
  const passed = primary.length > 0 && bg.length > 0;
  return {
    name: t('test.theme.test_css_vars'),
    passed,
    message: `primary: "${primary}", background: "${bg}"`,
    duration: Math.round(performance.now() - start),
  };
}

function testList(): TestResult {
  const start = performance.now();
  const sdk = getSdkSync();
  if (!sdk) {
    return { name: t('test.theme.test_list'), passed: false, message: 'SDK not available' };
  }
  try {
    const themes = sdk.themes.listThemes();
    const hasLight = themes.some((th) => th.id === 'default-light');
    const hasDark = themes.some((th) => th.id === 'default-dark');
    const passed = hasLight && hasDark;
    return {
      name: t('test.theme.test_list'),
      passed,
      message: `Themes: ${themes.map((th) => th.id).join(', ')}`,
      duration: Math.round(performance.now() - start),
    };
  } catch (error) {
    return {
      name: t('test.theme.test_list'),
      passed: false,
      message: String(error),
      duration: Math.round(performance.now() - start),
    };
  }
}

function testDetect(): TestResult {
  const start = performance.now();
  const sdk = getSdkSync();
  if (!sdk) {
    return { name: t('test.theme.test_detect'), passed: false, message: 'SDK not available' };
  }
  const detected = sdk.themes.detectSystemTheme();
  const passed = detected === 'light' || detected === 'dark';
  return {
    name: t('test.theme.test_detect'),
    passed,
    message: `System preference: ${detected}`,
    duration: Math.round(performance.now() - start),
  };
}
</script>

<template>
  <div class="test-panel">
    <div class="panel-header">
      <h3 class="panel-title">{{ t('test.theme.title') }}</h3>
      <p class="panel-desc">{{ t('test.theme.description') }}</p>
      <div class="panel-actions">
        <button class="run-btn" :disabled="running" @click="runTests">{{ t('test.run') }}</button>
        <button class="ghost-btn" @click="toggleThemePreview">{{ t('test.theme.toggle_theme') }}</button>
      </div>
    </div>

    <div class="info-banner">
      <span class="banner-icon">🎨</span>
      <span class="banner-text">{{ t('test.theme.banner_info') }}</span>
    </div>

    <div class="palette-grid">
      <div v-for="item in palette" :key="item.key" class="palette-card">
        <div class="palette-swatch" :style="{ backgroundColor: item.value || '#f0f0f0' }"></div>
        <div class="palette-meta">
          <div class="palette-label">{{ t(`test.theme.palette_${item.label}`) }}</div>
          <div class="palette-value">{{ item.value || '—' }}</div>
        </div>
      </div>
    </div>
    <div class="panel-results">
      <div v-for="result in results" :key="result.name" class="result-item">
        <span class="result-status" :class="result.passed ? 'pass' : 'fail'">{{ result.passed ? t('test.pass') : t('test.fail') }}</span>
        <span class="result-name">{{ result.name }}</span>
        <span class="result-message">{{ result.message }}</span>
        <span v-if="result.duration !== undefined" class="result-duration">{{ result.duration }}{{ t('test.ms') }}</span>
      </div>
      <p v-if="results.length === 0" class="no-results">{{ t('test.pending') }}</p>
    </div>
  </div>
</template>

<style src="../../styles/panel-common.css"></style>
