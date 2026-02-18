import { Checkbox } from '@chips/components';
import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from '../../services/i18n-service';
import { getSdkSync } from '../../services/sdk-service';
import type { TestResult } from '../../types';
import { InfoBanner, PanelHeader, PanelResults, PanelShell } from './PanelPrimitives';

interface EventLogEntry {
  time: string;
  name: string;
  payload: string;
}

export default function EventTestPanel() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [emitCount, setEmitCount] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoScroll && logRef.current) {
      logRef.current.scrollTop = 0;
    }
  }, [autoScroll, eventLog]);

  const emitEvent = () => {
    const sdk = getSdkSync();
    const time = new Date().toLocaleTimeString();
    if (!sdk) {
      setEventLog((prev) => [
        { time, name: 'test:ui', payload: t('test.event.sdk_missing') },
        ...prev,
      ]);
      return;
    }

    const payload = { source: 'test-panel', at: Date.now() };
    sdk.events.emitSync('test:ui-ping', payload);

    setEmitCount((value) => value + 1);
    setEventLog((prev) => [
      { time, name: 'test:ui-ping', payload: JSON.stringify(payload) },
      ...prev,
    ]);
  };

  const clearLog = () => {
    setEventLog([]);
    setEmitCount(0);
  };

  const runTests = async () => {
    setRunning(true);

    const nextResults: TestResult[] = [];
    nextResults.push(await testPubSub());
    nextResults.push(await testSdkEvents());
    nextResults.push(await testUnsubscribe());

    setResults(nextResults);
    setRunning(false);
  };

  const logSize = useMemo(() => eventLog.length, [eventLog.length]);

  return (
    <PanelShell>
      <PanelHeader
        title={t('test.event.title')}
        description={t('test.event.description')}
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
            key: 'emit',
            label: t('test.event.emit'),
            onClick: emitEvent,
            variant: 'ghost',
          },
          {
            key: 'clear',
            label: t('test.event.clear'),
            onClick: clearLog,
            variant: 'ghost',
          },
        ]}
      />

      <InfoBanner icon="📡" text={t('test.event.banner_info')} />

      <div className="event-controls">
        <Checkbox checked={autoScroll} onCheckedChange={setAutoScroll}>
          Auto scroll
        </Checkbox>
      </div>

      <div className="event-stats">
        <div className="stat-card">
          <div className="stat-label">{t('test.event.emit_count')}</div>
          <div className="stat-value">{emitCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('test.event.log_size')}</div>
          <div className="stat-value">{logSize}</div>
        </div>
      </div>

      <div className="event-log" ref={logRef}>
        <div className="event-log-header">
          <span className="event-log-title">{t('test.event.log_title')}</span>
        </div>
        {eventLog.length === 0 ? (
          <div className="event-log-empty">{t('test.event.log_empty')}</div>
        ) : (
          <div className="event-log-list">
            {eventLog.map((item) => (
              <div key={`${item.time}-${item.name}-${item.payload}`} className="event-log-item">
                <span className="event-time">{item.time}</span>
                <span className="event-name">{item.name}</span>
                <span className="event-payload">{item.payload}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <PanelResults results={results} />
    </PanelShell>
  );
}

async function testPubSub(): Promise<TestResult> {
  const start = performance.now();
  const sdk = getSdkSync();
  if (!sdk) {
    return {
      name: t('test.event.test_pubsub'),
      passed: false,
      message: 'SDK not available',
    };
  }

  let received = false;
  let receivedData: unknown = null;

  const handlerId = sdk.on('test:ping', (data: unknown) => {
    received = true;
    receivedData = data;
  });

  sdk.events.emitSync('test:ping', { value: 'pong' });
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
    return {
      name: t('test.event.test_sdk_events'),
      passed: false,
      message: 'SDK not available',
    };
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
    return {
      name: t('test.event.test_unsubscribe'),
      passed: false,
      message: 'SDK not available',
    };
  }

  let callCount = 0;
  const handlerId = sdk.on('test:unsub', () => {
    callCount += 1;
  });

  sdk.events.emitSync('test:unsub', {});
  sdk.off('test:unsub', handlerId);
  sdk.events.emitSync('test:unsub', {});

  return {
    name: t('test.event.test_unsubscribe'),
    passed: callCount === 1,
    message: `Call count after unsubscribe: ${callCount} (expected 1)`,
    duration: Math.round(performance.now() - start),
  };
}
