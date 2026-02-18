/**
 * 应用全局状态（React Context）
 * @module renderer/state/app-store
 */

import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { AppState, ConnectionState, Locale, ThemeType } from '../types';

interface AppStoreValue {
  state: AppState;
  locale: Locale;
  theme: ThemeType;
  connectionState: ConnectionState;
  sdkReady: boolean;
  errorMessage: string | null;
  isDark: boolean;
  isReady: boolean;
  setState: (next: AppState) => void;
  setLocale: (next: Locale) => void;
  setTheme: (next: ThemeType) => void;
  setConnectionState: (next: ConnectionState) => void;
  setSdkReady: (next: boolean) => void;
  setError: (message: string | null) => void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [state, setStateValue] = useState<AppState>('loading');
  const [locale, setLocaleValue] = useState<Locale>('zh-CN');
  const [theme, setThemeValue] = useState<ThemeType>('default-light');
  const [connectionState, setConnectionStateValue] = useState<ConnectionState>('disconnected');
  const [sdkReady, setSdkReadyValue] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setState = useCallback((next: AppState) => {
    setStateValue(next);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleValue(next);
  }, []);

  const setTheme = useCallback((next: ThemeType) => {
    setThemeValue(next);
  }, []);

  const setConnectionState = useCallback((next: ConnectionState) => {
    setConnectionStateValue(next);
  }, []);

  const setSdkReady = useCallback((next: boolean) => {
    setSdkReadyValue(next);
  }, []);

  const setError = useCallback((message: string | null) => {
    setErrorMessage(message);
    if (message) {
      setStateValue('error');
    }
  }, []);

  const value = useMemo<AppStoreValue>(
    () => ({
      state,
      locale,
      theme,
      connectionState,
      sdkReady,
      errorMessage,
      isDark: theme === 'default-dark',
      isReady: state === 'ready',
      setState,
      setLocale,
      setTheme,
      setConnectionState,
      setSdkReady,
      setError,
    }),
    [
      connectionState,
      errorMessage,
      locale,
      sdkReady,
      setConnectionState,
      setError,
      setLocale,
      setSdkReady,
      setState,
      setTheme,
      state,
      theme,
    ],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }
  return context;
}
