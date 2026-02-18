/**
 * Chips AppTemplate - 根组件（React）
 * @module App
 */

import {
  Button,
  ConfigProvider,
  Tabs,
  ThemeProvider,
  type TabItem,
} from '@chips/components';
import { useCallback, useEffect, useRef, useState } from 'react';
import AppHeader from './components/AppHeader';
import StatusBar from './components/StatusBar';
import CoreTestPanel from './components/panels/CoreTestPanel';
import EventTestPanel from './components/panels/EventTestPanel';
import I18nTestPanel from './components/panels/I18nTestPanel';
import SdkTestPanel from './components/panels/SdkTestPanel';
import ThemeTestPanel from './components/panels/ThemeTestPanel';
import ComponentShowcasePanel from './components/panels/ComponentShowcasePanel';
import { t, initializeI18n, setLocale } from './services/i18n-service';
import {
  destroyKeyboard,
  initializeKeyboard,
  registerStandardShortcuts,
} from './services/keyboard-service';
import { appLogger } from './services/logger-service';
import { getSdkSync } from './services/sdk-service';
import { getTheme, initializeTheme, setTheme } from './services/theme-service';
import { useAppStore } from './state/app-store';
import type { Locale, ThemeType } from './types';
import { themeDefaults, themeTokens } from './theme/theme-tokens';

export default function App() {
  const appStore = useAppStore();
  const {
    locale,
    theme,
    isReady,
    errorMessage,
    setState: setAppState,
    setLocale: setAppLocale,
    setTheme: setAppTheme,
    setConnectionState,
    setSdkReady,
    setError,
  } = appStore;
  const [activePanel, setActivePanel] = useState('sdk');

  const initialLocaleRef = useRef(locale);
  const localeRef = useRef(locale);
  const themeRef = useRef(theme);

  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const applyLocale = useCallback(
    (locale: Locale) => {
      setLocale(locale);
      setAppLocale(locale);
    },
    [setAppLocale],
  );

  const applyTheme = useCallback(
    (theme: ThemeType) => {
      setTheme(theme);
      setAppTheme(theme);
    },
    [setAppTheme],
  );

  useEffect(() => {
    let disposed = false;
    let removeMenuListener: (() => void) | undefined;

    const init = async () => {
      try {
        setAppState('loading');
        setConnectionState('connecting');

        appLogger.info('initializing application');

        await initializeI18n(initialLocaleRef.current);

        const sdk = getSdkSync();
        setSdkReady(Boolean(sdk?.isReady));
        setConnectionState(sdk?.isConnected ? 'connected' : 'disconnected');

        initializeTheme();
        const detectedTheme = getTheme();
        setAppTheme(detectedTheme);

        initializeKeyboard();
        registerStandardShortcuts({
          onToggleTheme: () => {
            const next = themeRef.current === 'default-dark' ? 'default-light' : 'default-dark';
            applyTheme(next);
          },
          onToggleLocale: () => {
            const next = localeRef.current === 'zh-CN' ? 'en-US' : 'zh-CN';
            applyLocale(next);
          },
        });

        if (window.electronAPI?.onMenuAction) {
          removeMenuListener = window.electronAPI.onMenuAction((action: string) => {
            appLogger.info('menu action received', { action });
          });
        }

        if (disposed) {
          return;
        }

        setAppState('ready');
        appLogger.info('application initialized successfully');
      } catch (error) {
        const message = error instanceof Error ? error.message : t('app.error_unknown');
        setConnectionState('error');
        setError(message);
        appLogger.error('initialization failed', { error: String(error) });
      }
    };

    void init();

    return () => {
      disposed = true;
      removeMenuListener?.();
      destroyKeyboard();
    };
  }, [
    applyLocale,
    applyTheme,
    setAppState,
    setConnectionState,
    setSdkReady,
    setAppTheme,
    setError,
  ]);

  const panelItems: TabItem[] = [
    { id: 'sdk', label: t('test.sdk.title'), content: <SdkTestPanel /> },
    { id: 'i18n', label: t('test.i18n.title'), content: <I18nTestPanel /> },
    { id: 'theme', label: t('test.theme.title'), content: <ThemeTestPanel /> },
    {
      id: 'components',
      label: t('test.components.title'),
      content: <ComponentShowcasePanel />,
    },
    { id: 'event', label: t('test.event.title'), content: <EventTestPanel /> },
    { id: 'core', label: t('test.core.title'), content: <CoreTestPanel /> },
  ];

  const retryInit = () => {
    setAppState('loading');
    setError(null);
    globalThis.location.reload();
  };

  return (
    <ThemeProvider className="app-theme-root" tokens={themeTokens[theme]} defaults={themeDefaults}>
      <ConfigProvider
        config={{
          appLocale: locale,
          appTheme: theme,
        }}
      >
        <div className="app-container">
          {!isReady && !errorMessage ? (
            <div className="app-loading">
              <div className="loading-spinner" />
              <p className="loading-text">{t('app.loading')}</p>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="app-error">
              <p className="error-title">{t('app.error_title')}</p>
              <p className="error-message">{errorMessage}</p>
              <Button className="error-retry-btn" onClick={retryInit}>
                {t('app.error_retry')}
              </Button>
            </div>
          ) : null}

          {isReady ? (
            <>
              <AppHeader
                locale={locale}
                theme={theme}
                onLocaleChange={applyLocale}
                onThemeToggle={(darkMode) =>
                  applyTheme(darkMode ? 'default-dark' : 'default-light')
                }
              />

              <main className="app-main">
                <Tabs
                  chipsScope="app-tabs"
                  className="test-tabs"
                  value={activePanel}
                  onValueChange={(value) => setActivePanel(value)}
                  items={panelItems}
                />
              </main>

              <StatusBar />
            </>
          ) : null}
        </div>
      </ConfigProvider>
    </ThemeProvider>
  );
}
