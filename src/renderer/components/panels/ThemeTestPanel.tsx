import { RadioGroup, Switch } from '@chips/components';
import { useEffect, useState } from 'react';
import { t } from '../../services/i18n-service';
import { getSdkSync } from '../../services/sdk-service';
import { getTheme, setTheme } from '../../services/theme-service';
import { useAppStore } from '../../state/app-store';
import type { TestResult, ThemeType } from '../../types';
import { InfoBanner, PanelHeader, PanelResults, PanelShell } from './PanelPrimitives';

interface PaletteItem {
  key: string;
  label: string;
  value: string;
}

export default function ThemeTestPanel() {
  const appStore = useAppStore();
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [palette, setPalette] = useState<PaletteItem[]>([]);

  const refreshPalette = () => {
    const root = document.documentElement;
    setPalette([
      {
        key: '--chips-color-primary',
        label: 'primary',
        value: getComputedStyle(root).getPropertyValue('--chips-color-primary').trim(),
      },
      {
        key: '--chips-color-background',
        label: 'background',
        value: getComputedStyle(root).getPropertyValue('--chips-color-background').trim(),
      },
      {
        key: '--chips-color-surface',
        label: 'surface',
        value: getComputedStyle(root).getPropertyValue('--chips-color-surface').trim(),
      },
      {
        key: '--chips-color-border',
        label: 'border',
        value: getComputedStyle(root).getPropertyValue('--chips-color-border').trim(),
      },
      {
        key: '--chips-color-text',
        label: 'text',
        value: getComputedStyle(root).getPropertyValue('--chips-color-text').trim(),
      },
    ]);
  };

  useEffect(() => {
    refreshPalette();
  }, []);

  useEffect(() => {
    refreshPalette();
  }, [appStore.theme]);

  const applyTheme = (theme: ThemeType) => {
    setTheme(theme);
    appStore.setTheme(theme);
    refreshPalette();
  };

  const runTests = () => {
    setRunning(true);

    const nextResults: TestResult[] = [];
    nextResults.push(testSwitch(applyTheme));
    nextResults.push(testCSSVars());
    nextResults.push(testList());
    nextResults.push(testDetect());

    setResults(nextResults);
    setRunning(false);
    refreshPalette();
  };

  return (
    <PanelShell>
      <PanelHeader
        title={t('test.theme.title')}
        description={t('test.theme.description')}
        actions={[
          {
            key: 'run',
            label: t('test.run'),
            onClick: runTests,
            disabled: running,
          },
        ]}
      />

      <InfoBanner icon="🎨" text={t('test.theme.banner_info')} />

      <div className="theme-controls">
        <RadioGroup
          chipsScope="panel-radio-group"
          className="theme-radio-group"
          value={appStore.theme}
          onValueChange={(value) => applyTheme(value as ThemeType)}
          options={[
            { label: 'default-light', value: 'default-light' },
            { label: 'default-dark', value: 'default-dark' },
          ]}
        />
        <Switch
          chipsScope="panel-switch"
          checked={appStore.theme === 'default-dark'}
          onCheckedChange={(checked) => applyTheme(checked ? 'default-dark' : 'default-light')}
        >
          {t('test.theme.toggle_theme')}
        </Switch>
      </div>

      <div className="palette-grid">
        {palette.map((item) => (
          <div key={item.key} className="palette-card">
            <div className="palette-swatch" style={{ backgroundColor: item.value || '#f0f0f0' }} />
            <div className="palette-meta">
              <div className="palette-label">{t(`test.theme.palette_${item.label}`)}</div>
              <div className="palette-value">{item.value || '—'}</div>
            </div>
          </div>
        ))}
      </div>

      <PanelResults results={results} />
    </PanelShell>
  );
}

function testSwitch(applyTheme: (theme: ThemeType) => void): TestResult {
  const start = performance.now();
  const originalTheme = getTheme();

  applyTheme('default-dark');
  const darkAttr = document.documentElement.getAttribute('data-theme');

  applyTheme('default-light');
  const lightAttr = document.documentElement.getAttribute('data-theme');

  applyTheme(originalTheme);

  const passed = darkAttr === 'dark' && lightAttr === 'light';
  return {
    name: t('test.theme.test_switch'),
    passed,
    message: `dark: data-theme="${darkAttr}", light: data-theme="${lightAttr}"`,
    duration: Math.round(performance.now() - start),
  };
}

function testCSSVars(): TestResult {
  const start = performance.now();
  const root = document.documentElement;
  const primary = getComputedStyle(root).getPropertyValue('--chips-color-primary').trim();
  const background = getComputedStyle(root).getPropertyValue('--chips-color-background').trim();
  const passed = primary.length > 0 && background.length > 0;

  return {
    name: t('test.theme.test_css_vars'),
    passed,
    message: `primary: "${primary}", background: "${background}"`,
    duration: Math.round(performance.now() - start),
  };
}

function testList(): TestResult {
  const start = performance.now();
  const sdk = getSdkSync();
  if (!sdk) {
    return {
      name: t('test.theme.test_list'),
      passed: false,
      message: 'SDK not available',
    };
  }

  try {
    const themes = sdk.themes.listThemes();
    const hasLight = themes.some((theme) => theme.id === 'default-light');
    const hasDark = themes.some((theme) => theme.id === 'default-dark');

    return {
      name: t('test.theme.test_list'),
      passed: hasLight && hasDark,
      message: `Themes: ${themes.map((theme) => theme.id).join(', ')}`,
      duration: Math.round(performance.now() - start),
    };
  } catch (error) {
    return {
      name: t('test.theme.test_list'),
      passed: false,
      message: String(error),
      duration: Math.round(performance.now() - start),
    };
  }
}

function testDetect(): TestResult {
  const start = performance.now();
  const sdk = getSdkSync();
  if (!sdk) {
    return {
      name: t('test.theme.test_detect'),
      passed: false,
      message: 'SDK not available',
    };
  }

  const detected = sdk.themes.detectSystemTheme();

  return {
    name: t('test.theme.test_detect'),
    passed: detected === 'light' || detected === 'dark',
    message: `System preference: ${detected}`,
    duration: Math.round(performance.now() - start),
  };
}
