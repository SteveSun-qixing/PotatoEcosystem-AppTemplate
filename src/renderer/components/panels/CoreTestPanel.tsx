import { useCallback, useEffect, useState } from 'react';
import { getSdkSync } from '../../services/sdk-service';
import { t } from '../../services/i18n-service';
import type { TestResult } from '../../types';
import { InfoBanner, PanelHeader, PanelResults, PanelShell } from './PanelPrimitives';

interface CoreSnapshot {
  sdkReady: boolean;
  state: string;
  connected: boolean;
  hasRequest: boolean;
}

const DEFAULT_SNAPSHOT: CoreSnapshot = {
  sdkReady: false,
  state: 'unknown',
  connected: false,
  hasRequest: false,
};

export default function CoreTestPanel() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [snapshot, setSnapshot] = useState<CoreSnapshot>(DEFAULT_SNAPSHOT);

  const refreshSnapshot = useCallback(() => {
    const sdk = getSdkSync();
    setSnapshot({
      sdkReady: Boolean(sdk?.isReady),
      state: sdk?.state ?? 'unknown',
      connected: Boolean(sdk?.connector?.isConnected),
      hasRequest: typeof sdk?.connector?.request === 'function',
    });
  }, []);

  useEffect(() => {
    refreshSnapshot();
  }, [refreshSnapshot]);

  const runTests = async () => {
    setRunning(true);

    const nextResults: TestResult[] = [];
    nextResults.push(testConnector());
    nextResults.push(await testRequest());
    nextResults.push(testHealth());

    setResults(nextResults);
    setRunning(false);
    refreshSnapshot();
  };

  return (
    <PanelShell>
      <PanelHeader
        title={t('test.core.title')}
        description={t('test.core.description')}
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
            onClick: refreshSnapshot,
            variant: 'ghost',
          },
        ]}
      />

      <InfoBanner icon="⚡" text={t('test.core.banner_info')} />

      <div className="status-grid">
        <div className={`status-card ${snapshot.sdkReady ? 'status-highlight' : ''}`}>
          <div className="status-label">{t('test.core.status_ready')}</div>
          <div className="status-value">
            <span className={`status-dot ${snapshot.sdkReady ? 'pass' : 'fail'}`} />
            <span>{snapshot.sdkReady ? t('test.pass') : t('test.fail')}</span>
          </div>
        </div>
        <div className={`status-card ${snapshot.state === 'ready' ? 'status-highlight' : ''}`}>
          <div className="status-label">{t('test.core.status_state')}</div>
          <div className="status-value">
            <span className={`status-dot ${snapshot.state === 'ready' ? 'pass' : 'warn'}`} />
            <span>{formatState(snapshot.state)}</span>
          </div>
        </div>
        <div className={`status-card ${snapshot.connected ? 'status-highlight' : ''}`}>
          <div className="status-label">{t('test.core.status_connected')}</div>
          <div className="status-value">
            <span className={`status-dot ${snapshot.connected ? 'pass' : 'fail'}`} />
            <span>{snapshot.connected ? t('test.pass') : t('test.fail')}</span>
          </div>
        </div>
        <div className={`status-card ${snapshot.hasRequest ? 'status-highlight' : ''}`}>
          <div className="status-label">{t('test.core.status_request')}</div>
          <div className="status-value">
            <span className={`status-dot ${snapshot.hasRequest ? 'pass' : 'fail'}`} />
            <span>{snapshot.hasRequest ? t('test.pass') : t('test.fail')}</span>
          </div>
        </div>
      </div>

      <PanelResults results={results} />
    </PanelShell>
  );
}

function formatState(state: string): string {
  const known = ['ready', 'loading', 'connecting', 'connected', 'disconnected', 'error'];
  return known.includes(state) ? t(`status.${state}`) : state;
}

function testConnector(): TestResult {
  const start = performance.now();
  const sdk = getSdkSync();
  if (!sdk) {
    return {
      name: t('test.core.test_connector'),
      passed: false,
      message: 'SDK not available',
    };
  }

  const connector = sdk.connector;
  const hasConnector = Boolean(connector);
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
    return {
      name: t('test.core.test_request'),
      passed: false,
      message: 'SDK not available',
    };
  }

  try {
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
    return {
      name: t('test.core.test_health'),
      passed: false,
      message: 'SDK not available',
    };
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
