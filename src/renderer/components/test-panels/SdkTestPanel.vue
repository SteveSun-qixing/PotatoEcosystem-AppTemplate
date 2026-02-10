<script setup lang="ts">
/**
 * SDK 测试面板
 * @description 验证 SDK 初始化、状态查询、连接状态
 */

import { ref, onMounted } from 'vue';
import { t } from '../../services/i18n-service';
import { getSdkSync } from '../../services/sdk-service';
import { ChipsSDK } from '@chips/sdk';
import type { TestResult } from '../../types';

const results = ref<TestResult[]>([]);
const running = ref(false);
const status = ref({
  sdkExists: false,
  sdkState: 'unknown',
  connectorReady: false,
  modules: {
    i18n: false,
    events: false,
    config: false,
    connector: false,
  },
});

function refreshStatus(): void {
  const sdk = getSdkSync();
  status.value.sdkExists = !!sdk;
  status.value.sdkState = sdk?.state ?? 'unknown';
  status.value.connectorReady = !!sdk?.connector;
  status.value.modules = {
    i18n: !!sdk?.i18n,
    events: !!sdk?.events,
    config: !!sdk?.config,
    connector: !!sdk?.connector,
  };
}

function formatState(state: string): string {
  const known = ['ready', 'loading', 'connecting', 'connected', 'disconnected', 'error'];
  return known.includes(state) ? t(`status.${state}`) : state;
}

/**
 * 运行所有 SDK 测试
 */
async function runTests(): Promise<void> {
  running.value = true;
  results.value = [];

  // 测试 1: SDK 初始化
  results.value.push(await testInit());

  // 测试 2: SDK 状态查询
  results.value.push(await testState());

  // 测试 3: SDK 版本信息
  results.value.push(await testVersion());

  // 测试 4: SDK 模块加载
  results.value.push(await testModules());

  running.value = false;
  refreshStatus();
}

onMounted(() => {
  refreshStatus();
});

async function testInit(): Promise<TestResult> {
  const start = performance.now();
  try {
    const sdk = getSdkSync();
    const passed = sdk !== null;
    return {
      name: t('test.sdk.test_init'),
      passed,
      message: passed ? 'SDK instance exists' : 'SDK instance is null',
      duration: Math.round(performance.now() - start),
    };
  } catch (error) {
    return {
      name: t('test.sdk.test_init'),
      passed: false,
      message: String(error),
      duration: Math.round(performance.now() - start),
    };
  }
}

async function testState(): Promise<TestResult> {
  const start = performance.now();
  const sdk = getSdkSync();
  if (!sdk) {
    return { name: t('test.sdk.test_state'), passed: false, message: 'SDK not available' };
  }
  const state = sdk.state;
  return {
    name: t('test.sdk.test_state'),
    passed: state === 'ready',
    message: `State: ${state}`,
    duration: Math.round(performance.now() - start),
  };
}

async function testVersion(): Promise<TestResult> {
  const start = performance.now();
  const version = ChipsSDK.VERSION;
  return {
    name: t('test.sdk.test_version'),
    passed: !!version.sdk && !!version.protocol,
    message: `SDK: ${version.sdk}, Protocol: ${version.protocol}`,
    duration: Math.round(performance.now() - start),
  };
}

async function testModules(): Promise<TestResult> {
  const start = performance.now();
  const sdk = getSdkSync();
  if (!sdk) {
    return { name: t('test.sdk.test_modules'), passed: false, message: 'SDK not available' };
  }
  try {
    const hasI18n = !!sdk.i18n;
    const hasEvents = !!sdk.events;
    const hasConfig = !!sdk.config;
    const hasConnector = !!sdk.connector;
    const allLoaded = hasI18n && hasEvents && hasConfig && hasConnector;
    return {
      name: t('test.sdk.test_modules'),
      passed: allLoaded,
      message: `i18n:${hasI18n} events:${hasEvents} config:${hasConfig} connector:${hasConnector}`,
      duration: Math.round(performance.now() - start),
    };
  } catch (error) {
    return {
      name: t('test.sdk.test_modules'),
      passed: false,
      message: String(error),
      duration: Math.round(performance.now() - start),
    };
  }
}
</script>

<template>
  <div class="test-panel">
    <div class="panel-header">
      <h3 class="panel-title">{{ t('test.sdk.title') }}</h3>
      <p class="panel-desc">{{ t('test.sdk.description') }}</p>
      <div class="panel-actions">
        <button class="run-btn" :disabled="running" @click="runTests">
          {{ t('test.run') }}
        </button>
        <button class="ghost-btn" @click="refreshStatus">
          {{ t('test.refresh') }}
        </button>
      </div>
    </div>

    <div class="info-banner">
      <span class="banner-icon">ℹ️</span>
      <span class="banner-text">{{ t('test.sdk.banner_info') }}</span>
    </div>

    <div class="status-grid">
      <div class="status-card" :class="{ 'status-highlight': status.sdkExists }">
        <div class="status-label">{{ t('test.sdk.status_sdk') }}</div>
        <div class="status-value">
          <span class="status-dot" :class="status.sdkExists ? 'pass' : 'fail'"></span>
          <span>{{ status.sdkExists ? t('test.pass') : t('test.fail') }}</span>
        </div>
      </div>
      <div class="status-card" :class="{ 'status-highlight': status.sdkState === 'ready' }">
        <div class="status-label">{{ t('test.sdk.status_state') }}</div>
        <div class="status-value">
          <span class="status-dot" :class="status.sdkState === 'ready' ? 'pass' : 'warn'"></span>
          <span>{{ formatState(status.sdkState) }}</span>
        </div>
      </div>
      <div class="status-card" :class="{ 'status-highlight': status.connectorReady }">
        <div class="status-label">{{ t('test.sdk.status_connector') }}</div>
        <div class="status-value">
          <span class="status-dot" :class="status.connectorReady ? 'pass' : 'fail'"></span>
          <span>{{ status.connectorReady ? t('test.pass') : t('test.fail') }}</span>
        </div>
      </div>
      <div class="status-card full-width">
        <div class="status-label">{{ t('test.sdk.status_modules') }}</div>
        <div class="module-tags">
          <span class="module-tag" :class="status.modules.i18n ? 'pass' : 'fail'">
            <span class="tag-icon">{{ status.modules.i18n ? '✓' : '✗' }}</span>
            i18n
          </span>
          <span class="module-tag" :class="status.modules.events ? 'pass' : 'fail'">
            <span class="tag-icon">{{ status.modules.events ? '✓' : '✗' }}</span>
            events
          </span>
          <span class="module-tag" :class="status.modules.config ? 'pass' : 'fail'">
            <span class="tag-icon">{{ status.modules.config ? '✓' : '✗' }}</span>
            config
          </span>
          <span class="module-tag" :class="status.modules.connector ? 'pass' : 'fail'">
            <span class="tag-icon">{{ status.modules.connector ? '✓' : '✗' }}</span>
            connector
          </span>
        </div>
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
