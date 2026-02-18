import { ChipsSDK } from '@chips/sdk';
import { useCallback, useEffect, useState } from 'react';
import { getSdkSync } from '../../services/sdk-service';
import { t } from '../../services/i18n-service';
import type { TestResult } from '../../types';
import { InfoBanner, PanelHeader, PanelResults, PanelShell } from './PanelPrimitives';

interface SdkStatus {
  sdkExists: boolean;
  sdkState: string;
  connectorReady: boolean;
  modules: {
    i18n: boolean;
    events: boolean;
    config: boolean;
    connector: boolean;
  };
}

const DEFAULT_STATUS: SdkStatus = {
  sdkExists: false,
  sdkState: 'unknown',
  connectorReady: false,
  modules: {
    i18n: false,
    events: false,
    config: false,
    connector: false,
  },
};

export default function SdkTestPanel() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<SdkStatus>(DEFAULT_STATUS);

  const refreshStatus = useCallback(() => {
    const sdk = getSdkSync();
    setStatus({
      sdkExists: Boolean(sdk),
      sdkState: sdk?.state ?? 'unknown',
      connectorReady: Boolean(sdk?.connector),
      modules: {
        i18n: Boolean(sdk?.i18n),
        events: Boolean(sdk?.events),
        config: Boolean(sdk?.config),
        connector: Boolean(sdk?.connector),
      },
    });
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const runTests = useCallback(async () => {
    setRunning(true);

    const nextResults: TestResult[] = [];
    nextResults.push(await testInit());
    nextResults.push(await testState());
    nextResults.push(await testVersion());
    nextResults.push(await testModules());

    setResults(nextResults);
    setRunning(false);
    refreshStatus();
  }, [refreshStatus]);

  return (
    <PanelShell>
      <PanelHeader
        title={t('test.sdk.title')}
        description={t('test.sdk.description')}
        actions={[
          {
            key: 'run',
            label: t('test.run'),
            onClick: () => {
              void runTests();
            },
            disabled: running,
          },
          {
            key: 'refresh',
            label: t('test.refresh'),
            onClick: refreshStatus,
            variant: 'ghost',
          },
        ]}
      />

      <InfoBanner icon="ℹ️" text={t('test.sdk.banner_info')} />

      <div className="status-grid">
        <div className={`status-card ${status.sdkExists ? 'status-highlight' : ''}`}>
          <div className="status-label">{t('test.sdk.status_sdk')}</div>
          <div className="status-value">
            <span className={`status-dot ${status.sdkExists ? 'pass' : 'fail'}`} />
            <span>{status.sdkExists ? t('test.pass') : t('test.fail')}</span>
          </div>
        </div>
        <div className={`status-card ${status.sdkState === 'ready' ? 'status-highlight' : ''}`}>
          <div className="status-label">{t('test.sdk.status_state')}</div>
          <div className="status-value">
            <span className={`status-dot ${status.sdkState === 'ready' ? 'pass' : 'warn'}`} />
            <span>{formatState(status.sdkState)}</span>
          </div>
        </div>
        <div className={`status-card ${status.connectorReady ? 'status-highlight' : ''}`}>
          <div className="status-label">{t('test.sdk.status_connector')}</div>
          <div className="status-value">
            <span className={`status-dot ${status.connectorReady ? 'pass' : 'fail'}`} />
            <span>{status.connectorReady ? t('test.pass') : t('test.fail')}</span>
          </div>
        </div>
        <div className="status-card full-width">
          <div className="status-label">{t('test.sdk.status_modules')}</div>
          <div className="module-tags">
            {renderModuleTag('i18n', status.modules.i18n)}
            {renderModuleTag('events', status.modules.events)}
            {renderModuleTag('config', status.modules.config)}
            {renderModuleTag('connector', status.modules.connector)}
          </div>
        </div>
      </div>

      <PanelResults results={results} />
    </PanelShell>
  );
}

function renderModuleTag(label: string, loaded: boolean) {
  return (
    <span key={label} className={`module-tag ${loaded ? 'pass' : 'fail'}`}>
      <span className="tag-icon">{loaded ? '✓' : '✗'}</span>
      {label}
    </span>
  );
}

function formatState(state: string): string {
  const known = ['ready', 'loading', 'connecting', 'connected', 'disconnected', 'error'];
  return known.includes(state) ? t(`status.${state}`) : state;
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
    return {
      name: t('test.sdk.test_state'),
      passed: false,
      message: 'SDK not available',
    };
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
    passed: Boolean(version.sdk && version.protocol),
    message: `SDK: ${version.sdk}, Protocol: ${version.protocol}`,
    duration: Math.round(performance.now() - start),
  };
}

async function testModules(): Promise<TestResult> {
  const start = performance.now();
  const sdk = getSdkSync();
  if (!sdk) {
    return {
      name: t('test.sdk.test_modules'),
      passed: false,
      message: 'SDK not available',
    };
  }

  try {
    const hasI18n = Boolean(sdk.i18n);
    const hasEvents = Boolean(sdk.events);
    const hasConfig = Boolean(sdk.config);
    const hasConnector = Boolean(sdk.connector);
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
