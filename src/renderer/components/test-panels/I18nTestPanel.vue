<script setup lang="ts">
/**
 * 多语言测试面板
 * @description 验证多语言切换、变量插值、key 查找
 */

import { ref, computed } from 'vue';
import { t, setLocale, getLocale } from '../../services/i18n-service';
import { getSdkSync } from '../../services/sdk-service';
import { useAppStore } from '../../stores/app-store';
import type { TestResult } from '../../types';

const appStore = useAppStore();
const results = ref<TestResult[]>([]);
const running = ref(false);
const sampleCount = ref(42);

const currentLocale = computed(() => appStore.locale);
const sampleTitle = computed(() => t('app.title'));
const sampleStatus = computed(() => t('status.ready'));

function toggleLocalePreview(): void {
  const next = currentLocale.value === 'zh-CN' ? 'en-US' : 'zh-CN';
  setLocale(next);
  appStore.setLocale(next);
}

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
      <div class="panel-actions">
        <button class="run-btn" :disabled="running" @click="runTests">
          {{ t('test.run') }}
        </button>
        <button class="ghost-btn" @click="toggleLocalePreview">
          {{ t('test.i18n.toggle_locale') }}
        </button>
      </div>
    </div>

    <div class="info-banner">
      <span class="banner-icon">🌍</span>
      <span class="banner-text">{{ t('test.i18n.banner_info') }}</span>
    </div>

    <div class="preview-grid">
      <div class="preview-card">
        <div class="preview-label">{{ t('test.i18n.current_locale') }}</div>
        <div class="preview-value">{{ currentLocale }}</div>
      </div>
      <div class="preview-card">
        <div class="preview-label">{{ t('test.i18n.sample_title') }}</div>
        <div class="preview-value">{{ sampleTitle }}</div>
      </div>
      <div class="preview-card">
        <div class="preview-label">{{ t('test.i18n.sample_status') }}</div>
        <div class="preview-value">{{ sampleStatus }}</div>
      </div>
      <div class="preview-card">
        <div class="preview-label">{{ t('test.i18n.sample_count') }}</div>
        <div class="preview-value">{{ sampleCount }}</div>
      </div>
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

<style src="../../styles/panel-common.css"></style>
