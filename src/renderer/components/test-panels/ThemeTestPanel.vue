<script setup lang="ts">
/**
 * 主题测试面板
 * @description 验证主题切换、CSS 变量注入、亮暗模式
 */

import { ref } from 'vue';
import { t } from '../../services/i18n-service';
import { getSdkSync } from '../../services/sdk-service';
import { setTheme, getTheme } from '../../services/theme-service';
import { useAppStore } from '../../stores/app-store';
import type { TestResult } from '../../types';

const appStore = useAppStore();
const results = ref<TestResult[]>([]);
const running = ref(false);

async function runTests(): Promise<void> {
  running.value = true;
  results.value = [];

  results.value.push(testSwitch());
  results.value.push(testCSSVars());
  results.value.push(testList());
  results.value.push(testDetect());

  running.value = false;
}

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
      <button class="run-btn" :disabled="running" @click="runTests">{{ t('test.run') }}</button>
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

<style scoped>
.test-panel { display: flex; flex-direction: column; gap: var(--chips-spacing-md); }
.panel-header { display: flex; flex-direction: column; gap: var(--chips-spacing-xs); }
.panel-title { font-size: var(--chips-font-size-base); font-weight: var(--chips-font-weight-semibold); color: var(--chips-color-text); }
.panel-desc { font-size: var(--chips-font-size-sm); color: var(--chips-color-text-secondary); }
.run-btn { align-self: flex-start; margin-top: var(--chips-spacing-xs); padding: var(--chips-spacing-xs) var(--chips-spacing-md); background-color: var(--chips-color-primary); color: #fff; border: none; border-radius: var(--chips-radius-sm); font-size: var(--chips-font-size-sm); cursor: pointer; }
.run-btn:hover { opacity: 0.9; }
.run-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.panel-results { display: flex; flex-direction: column; gap: var(--chips-spacing-xs); }
.result-item { display: flex; align-items: center; gap: var(--chips-spacing-sm); padding: var(--chips-spacing-xs) var(--chips-spacing-sm); background-color: var(--chips-color-surface); border-radius: var(--chips-radius-sm); font-size: var(--chips-font-size-sm); }
.result-status { padding: 2px var(--chips-spacing-xs); border-radius: var(--chips-radius-sm); font-size: var(--chips-font-size-xs); font-weight: var(--chips-font-weight-medium); }
.result-status.pass { background-color: var(--chips-color-success); color: #fff; }
.result-status.fail { background-color: var(--chips-color-error); color: #fff; }
.result-name { font-weight: var(--chips-font-weight-medium); color: var(--chips-color-text); }
.result-message { flex: 1; color: var(--chips-color-text-secondary); font-size: var(--chips-font-size-xs); }
.result-duration { color: var(--chips-color-text-secondary); font-size: var(--chips-font-size-xs); }
.no-results { color: var(--chips-color-text-secondary); font-size: var(--chips-font-size-sm); font-style: italic; }
</style>
