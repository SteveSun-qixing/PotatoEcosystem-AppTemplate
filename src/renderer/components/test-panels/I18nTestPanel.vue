<script setup lang="ts">
/**
 * 多语言测试面板
 * @description 验证多语言切换、变量插值、key 查找
 */

import { ref } from 'vue';
import { t, setLocale, getLocale } from '../../services/i18n-service';
import { getSdkSync } from '../../services/sdk-service';
import { useAppStore } from '../../stores/app-store';
import type { TestResult } from '../../types';

const appStore = useAppStore();
const results = ref<TestResult[]>([]);
const running = ref(false);

async function runTests(): Promise<void> {
  running.value = true;
  results.value = [];

  results.value.push(testTranslate());
  results.value.push(testSwitch());
  results.value.push(testInterpolation());
  results.value.push(testFallback());

  running.value = false;
}

function testTranslate(): TestResult {
  const start = performance.now();
  const text = t('app.title');
  const passed = text !== 'app.title' && text.length > 0;
  return {
    name: t('test.i18n.test_translate'),
    passed,
    message: `t('app.title') = "${text}"`,
    duration: Math.round(performance.now() - start),
  };
}

function testSwitch(): TestResult {
  const start = performance.now();
  const originalLocale = getLocale();

  // 切换到英文
  setLocale('en-US');
  appStore.setLocale('en-US');
  const enText = t('app.title');

  // 切换回中文
  setLocale('zh-CN');
  appStore.setLocale('zh-CN');
  const zhText = t('app.title');

  // 恢复原始语言
  setLocale(originalLocale);
  appStore.setLocale(originalLocale);

  const passed = enText !== zhText && enText.length > 0 && zhText.length > 0;
  return {
    name: t('test.i18n.test_switch'),
    passed,
    message: `zh: "${zhText}", en: "${enText}"`,
    duration: Math.round(performance.now() - start),
  };
}

function testInterpolation(): TestResult {
  const start = performance.now();
  const sdk = getSdkSync();
  let passed = false;
  let message = '';

  if (sdk) {
    // 在 SDK 翻译中注册含变量的翻译
    sdk.i18n.addTranslation('zh-CN', {
      _test: { interpolation: '共 {count} 个文件' },
    });
    const text = sdk.t('_test.interpolation', { count: 42 });
    passed = text.includes('42');
    message = `t('_test.interpolation', {count: 42}) = "${text}"`;
  } else {
    message = 'SDK not available';
  }

  return {
    name: t('test.i18n.test_interpolation'),
    passed,
    message,
    duration: Math.round(performance.now() - start),
  };
}

function testFallback(): TestResult {
  const start = performance.now();
  // 请求一个不存在的 key，应该返回 key 本身
  const text = t('nonexistent.key.for.testing');
  const passed = text === 'nonexistent.key.for.testing';
  return {
    name: t('test.i18n.test_fallback'),
    passed,
    message: `Missing key returns: "${text}"`,
    duration: Math.round(performance.now() - start),
  };
}
</script>

<template>
  <div class="test-panel">
    <div class="panel-header">
      <h3 class="panel-title">{{ t('test.i18n.title') }}</h3>
      <p class="panel-desc">{{ t('test.i18n.description') }}</p>
      <button class="run-btn" :disabled="running" @click="runTests">
        {{ t('test.run') }}
      </button>
    </div>
    <div class="panel-results">
      <div v-for="result in results" :key="result.name" class="result-item">
        <span class="result-status" :class="result.passed ? 'pass' : 'fail'">
          {{ result.passed ? t('test.pass') : t('test.fail') }}
        </span>
        <span class="result-name">{{ result.name }}</span>
        <span class="result-message">{{ result.message }}</span>
        <span v-if="result.duration !== undefined" class="result-duration">
          {{ result.duration }}{{ t('test.ms') }}
        </span>
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
