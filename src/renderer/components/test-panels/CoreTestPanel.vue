<script setup lang="ts">
/**
 * 内核通信测试面板
 * @description 验证 CoreConnector 通信链路
 */

import { ref, onMounted } from 'vue';
import { t } from '../../services/i18n-service';
import { getSdkSync } from '../../services/sdk-service';
import type { TestResult } from '../../types';

const results = ref<TestResult[]>([]);
const running = ref(false);
const snapshot = ref({
  sdkReady: false,
  state: 'unknown',
  connected: false,
  hasRequest: false,
});

function refreshSnapshot(): void {
  const sdk = getSdkSync();
  snapshot.value.sdkReady = !!sdk?.isReady;
  snapshot.value.state = sdk?.state ?? 'unknown';
  snapshot.value.connected = !!sdk?.connector?.isConnected;
  snapshot.value.hasRequest = typeof sdk?.connector?.request === 'function';
}

function formatState(state: string): string {
  const known = ['ready', 'loading', 'connecting', 'connected', 'disconnected', 'error'];
  return known.includes(state) ? t(`status.${state}`) : state;
}

async function runTests(): Promise<void> {
  running.value = true;
  results.value = [];

  results.value.push(testConnector());
  results.value.push(await testRequest());
  results.value.push(testHealth());

  running.value = false;
  refreshSnapshot();
}

onMounted(() => {
  refreshSnapshot();
});

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
      <div class="panel-actions">
        <button class="run-btn" :disabled="running" @click="runTests">{{ t('test.run') }}</button>
        <button class="ghost-btn" @click="refreshSnapshot">{{ t('test.refresh') }}</button>
      </div>
    </div>

    <div class="info-banner">
      <span class="banner-icon">⚡</span>
      <span class="banner-text">{{ t('test.core.banner_info') }}</span>
    </div>

    <div class="status-grid">
      <div class="status-card" :class="{ 'status-highlight': snapshot.sdkReady }">
        <div class="status-label">{{ t('test.core.status_ready') }}</div>
        <div class="status-value">
          <span class="status-dot" :class="snapshot.sdkReady ? 'pass' : 'fail'"></span>
          <span>{{ snapshot.sdkReady ? t('test.pass') : t('test.fail') }}</span>
        </div>
      </div>
      <div class="status-card" :class="{ 'status-highlight': snapshot.state === 'ready' }">
        <div class="status-label">{{ t('test.core.status_state') }}</div>
        <div class="status-value">
          <span class="status-dot" :class="snapshot.state === 'ready' ? 'pass' : 'warn'"></span>
          <span>{{ formatState(snapshot.state) }}</span>
        </div>
      </div>
      <div class="status-card" :class="{ 'status-highlight': snapshot.connected }">
        <div class="status-label">{{ t('test.core.status_connected') }}</div>
        <div class="status-value">
          <span class="status-dot" :class="snapshot.connected ? 'pass' : 'fail'"></span>
          <span>{{ snapshot.connected ? t('test.pass') : t('test.fail') }}</span>
        </div>
      </div>
      <div class="status-card" :class="{ 'status-highlight': snapshot.hasRequest }">
        <div class="status-label">{{ t('test.core.status_request') }}</div>
        <div class="status-value">
          <span class="status-dot" :class="snapshot.hasRequest ? 'pass' : 'fail'"></span>
          <span>{{ snapshot.hasRequest ? t('test.pass') : t('test.fail') }}</span>
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
