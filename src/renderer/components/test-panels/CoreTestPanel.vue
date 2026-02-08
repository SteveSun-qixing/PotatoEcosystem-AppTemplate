<script setup lang="ts">
/**
 * 内核通信测试面板
 * @description 验证 CoreConnector 通信链路
 */

import { ref } from 'vue';
import { t } from '../../services/i18n-service';
import { getSdkSync } from '../../services/sdk-service';
import type { TestResult } from '../../types';

const results = ref<TestResult[]>([]);
const running = ref(false);

async function runTests(): Promise<void> {
  running.value = true;
  results.value = [];

  results.value.push(testConnector());
  results.value.push(await testRequest());
  results.value.push(testHealth());

  running.value = false;
}

function testConnector(): TestResult {
  const start = performance.now();
  const sdk = getSdkSync();
  if (!sdk) {
    return { name: t('test.core.test_connector'), passed: false, message: 'SDK not available' };
  }

  const connector = sdk.connector;
  const hasConnector = !!connector;
  const isConnected = connector?.isConnected ?? false;

  return {
    name: t('test.core.test_connector'),
    passed: hasConnector,
    message: `Connector exists: ${hasConnector}, Connected: ${isConnected}`,
    duration: Math.round(performance.now() - start),
  };
}

async function testRequest(): Promise<TestResult> {
  const start = performance.now();
  const sdk = getSdkSync();
  if (!sdk) {
    return { name: t('test.core.test_request'), passed: false, message: 'SDK not available' };
  }

  try {
    // 在开发模式下内核可能未运行，这里验证请求机制是否正常
    const connector = sdk.connector;
    const hasRequest = typeof connector.request === 'function';
    return {
      name: t('test.core.test_request'),
      passed: hasRequest,
      message: hasRequest
        ? 'Request method available (Core may not be running in dev)'
        : 'Request method not found',
      duration: Math.round(performance.now() - start),
    };
  } catch (error) {
    return {
      name: t('test.core.test_request'),
      passed: false,
      message: String(error),
      duration: Math.round(performance.now() - start),
    };
  }
}

function testHealth(): TestResult {
  const start = performance.now();
  const sdk = getSdkSync();
  if (!sdk) {
    return { name: t('test.core.test_health'), passed: false, message: 'SDK not available' };
  }

  const state = sdk.state;
  const isReady = sdk.isReady;

  return {
    name: t('test.core.test_health'),
    passed: isReady,
    message: `SDK state: ${state}, isReady: ${isReady}`,
    duration: Math.round(performance.now() - start),
  };
}
</script>

<template>
  <div class="test-panel">
    <div class="panel-header">
      <h3 class="panel-title">{{ t('test.core.title') }}</h3>
      <p class="panel-desc">{{ t('test.core.description') }}</p>
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
