import { Input } from '@chips/components';
import { useState } from 'react';
import { t, setLocale, getLocale } from '../../services/i18n-service';
import { getSdkSync } from '../../services/sdk-service';
import { useAppStore } from '../../state/app-store';
import type { TestResult } from '../../types';
import { InfoBanner, PanelHeader, PanelResults, PanelShell } from './PanelPrimitives';

export default function I18nTestPanel() {
  const appStore = useAppStore();
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [sampleCount, setSampleCount] = useState('42');

  const currentLocale = appStore.locale;
  const sampleTitle = t('app.title');
  const sampleStatus = t('status.ready');

  const toggleLocalePreview = () => {
    const next = currentLocale === 'zh-CN' ? 'en-US' : 'zh-CN';
    setLocale(next);
    appStore.setLocale(next);
  };

  const runTests = () => {
    setRunning(true);
    const nextResults: TestResult[] = [];

    nextResults.push(testTranslate());
    nextResults.push(testSwitch(appStore));
    nextResults.push(testInterpolation(Number(sampleCount) || 0));
    nextResults.push(testFallback());

    setResults(nextResults);
    setRunning(false);
  };

  return (
    <PanelShell>
      <PanelHeader
        title={t('test.i18n.title')}
        description={t('test.i18n.description')}
        actions={[
          {
            key: 'run',
            label: t('test.run'),
            onClick: runTests,
            disabled: running,
          },
          {
            key: 'toggle-locale',
            label: t('test.i18n.toggle_locale'),
            onClick: toggleLocalePreview,
            variant: 'ghost',
          },
        ]}
      />

      <InfoBanner icon="🌍" text={t('test.i18n.banner_info')} />

      <div className="preview-grid">
        <div className="preview-card">
          <div className="preview-label">{t('test.i18n.current_locale')}</div>
          <div className="preview-value">{currentLocale}</div>
        </div>
        <div className="preview-card">
          <div className="preview-label">{t('test.i18n.sample_title')}</div>
          <div className="preview-value">{sampleTitle}</div>
        </div>
        <div className="preview-card">
          <div className="preview-label">{t('test.i18n.sample_status')}</div>
          <div className="preview-value">{sampleStatus}</div>
        </div>
        <div className="preview-card">
          <Input
            chipsScope="panel-input"
            className="panel-inline-input"
            label={t('test.i18n.sample_count')}
            value={sampleCount}
            onChange={(event) => setSampleCount(event.currentTarget.value)}
          />
        </div>
      </div>

      <PanelResults results={results} />
    </PanelShell>
  );
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

function testSwitch(appStore: { setLocale: (locale: 'zh-CN' | 'en-US') => void }): TestResult {
  const start = performance.now();
  const originalLocale = getLocale();

  setLocale('en-US');
  appStore.setLocale('en-US');
  const enText = t('app.title');

  setLocale('zh-CN');
  appStore.setLocale('zh-CN');
  const zhText = t('app.title');

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

function testInterpolation(count: number): TestResult {
  const start = performance.now();
  const sdk = getSdkSync();
  let passed = false;
  let message = '';

  if (sdk) {
    sdk.i18n.addTranslation('zh-CN', {
      _test: { interpolation: '共 {count} 个文件' },
    });
    const text = sdk.t('_test.interpolation', { count });
    passed = text.includes(String(count));
    message = `t('_test.interpolation', {count: ${count}}) = "${text}"`;
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
  const text = t('nonexistent.key.for.testing');
  const passed = text === 'nonexistent.key.for.testing';

  return {
    name: t('test.i18n.test_fallback'),
    passed,
    message: `Missing key returns: "${text}"`,
    duration: Math.round(performance.now() - start),
  };
}
