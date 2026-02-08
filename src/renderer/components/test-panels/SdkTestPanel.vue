<script setup lang="ts">
/**
 * SDK 测试面板
 * @description 验证 SDK 初始化、状态查询、连接状态
 */

import { ref } from 'vue';
import { t } from '../../services/i18n-service';
import { getSdkSync } from '../../services/sdk-service';
import { ChipsSDK } from '@chips/sdk';
import type { TestResult } from '../../types';

const results = ref<TestResult[]>([]);
const running = ref(false);

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
}

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
.run-btn { align-self: flex-start; margin-top: var(--chips-spacing-xs); padding: var(--chips-spacing-xs) var(--chips-spacing-md); background-color: var(--chips-color-primary); color: #fff; border: none; border-radius: var(--chips-radius-sm); font-size: var(--chips-font-size-sm); cursor: pointer; transition: opacity var(--chips-duration-fast); }
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
