<script setup lang="ts">
/**
 * 事件总线测试面板
 * @description 验证事件发布/订阅、SDK 事件流
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

  results.value.push(await testPubSub());
  results.value.push(await testSdkEvents());
  results.value.push(await testUnsubscribe());

  running.value = false;
}

async function testPubSub(): Promise<TestResult> {
  const start = performance.now();
  const sdk = getSdkSync();
  if (!sdk) {
    return { name: t('test.event.test_pubsub'), passed: false, message: 'SDK not available' };
  }

  let received = false;
  let receivedData: unknown = null;

  const handlerId = sdk.on('test:ping', (data: unknown) => {
    received = true;
    receivedData = data;
  });

  sdk.events.emitSync('test:ping', { value: 'pong' });

  // 清理
  sdk.off('test:ping', handlerId);

  const passed = received && (receivedData as Record<string, unknown>)?.value === 'pong';
  return {
    name: t('test.event.test_pubsub'),
    passed,
    message: `Received: ${received}, Data: ${JSON.stringify(receivedData)}`,
    duration: Math.round(performance.now() - start),
  };
}

async function testSdkEvents(): Promise<TestResult> {
  const start = performance.now();
  const sdk = getSdkSync();
  if (!sdk) {
    return { name: t('test.event.test_sdk_events'), passed: false, message: 'SDK not available' };
  }

  let eventFired = false;
  const handlerId = sdk.on('test:custom-event', () => {
    eventFired = true;
  });

  sdk.events.emitSync('test:custom-event', { source: 'test-panel' });
  sdk.off('test:custom-event', handlerId);

  return {
    name: t('test.event.test_sdk_events'),
    passed: eventFired,
    message: eventFired ? 'Custom event fired and received' : 'Event not received',
    duration: Math.round(performance.now() - start),
  };
}

async function testUnsubscribe(): Promise<TestResult> {
  const start = performance.now();
  const sdk = getSdkSync();
  if (!sdk) {
    return { name: t('test.event.test_unsubscribe'), passed: false, message: 'SDK not available' };
  }

  let callCount = 0;
  const handlerId = sdk.on('test:unsub', () => {
    callCount++;
  });

  // 第一次触发
  sdk.events.emitSync('test:unsub', {});

  // 取消订阅
  sdk.off('test:unsub', handlerId);

  // 第二次触发（应该不会收到）
  sdk.events.emitSync('test:unsub', {});

  const passed = callCount === 1;
  return {
    name: t('test.event.test_unsubscribe'),
    passed,
    message: `Call count after unsubscribe: ${callCount} (expected 1)`,
    duration: Math.round(performance.now() - start),
  };
}
</script>

<template>
  <div class="test-panel">
    <div class="panel-header">
      <h3 class="panel-title">{{ t('test.event.title') }}</h3>
      <p class="panel-desc">{{ t('test.event.description') }}</p>
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
