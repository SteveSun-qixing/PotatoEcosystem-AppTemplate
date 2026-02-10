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
const eventLog = ref<{ time: string; name: string; payload: string }[]>([]);
const emitCount = ref(0);

function emitEvent(): void {
  const sdk = getSdkSync();
  const time = new Date().toLocaleTimeString();
  if (!sdk) {
    eventLog.value.unshift({
      time,
      name: 'test:ui',
      payload: t('test.event.sdk_missing'),
    });
    return;
  }

  const payload = { source: 'test-panel', at: Date.now() };
  sdk.events.emitSync('test:ui-ping', payload);
  emitCount.value += 1;
  eventLog.value.unshift({
    time,
    name: 'test:ui-ping',
    payload: JSON.stringify(payload),
  });
}

function clearLog(): void {
  eventLog.value = [];
  emitCount.value = 0;
}

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
      <div class="panel-actions">
        <button class="run-btn" :disabled="running" @click="runTests">{{ t('test.run') }}</button>
        <button class="ghost-btn" @click="emitEvent">{{ t('test.event.emit') }}</button>
        <button class="ghost-btn" @click="clearLog">{{ t('test.event.clear') }}</button>
      </div>
    </div>

    <div class="info-banner">
      <span class="banner-icon">📡</span>
      <span class="banner-text">{{ t('test.event.banner_info') }}</span>
    </div>

    <div class="event-stats">
      <div class="stat-card">
        <div class="stat-label">{{ t('test.event.emit_count') }}</div>
        <div class="stat-value">{{ emitCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">{{ t('test.event.log_size') }}</div>
        <div class="stat-value">{{ eventLog.length }}</div>
      </div>
    </div>

    <div class="event-log">
      <div class="event-log-header">
        <span class="event-log-title">{{ t('test.event.log_title') }}</span>
      </div>
      <div v-if="eventLog.length === 0" class="event-log-empty">{{ t('test.event.log_empty') }}</div>
      <div v-else class="event-log-list">
        <div v-for="item in eventLog" :key="item.time + item.name" class="event-log-item">
          <span class="event-time">{{ item.time }}</span>
          <span class="event-name">{{ item.name }}</span>
          <span class="event-payload">{{ item.payload }}</span>
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
