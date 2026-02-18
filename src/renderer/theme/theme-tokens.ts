import type { TokenBag } from '@chips/components';
import type { ThemeType } from '../types';

const commonTokens: TokenBag = {
  'chips-spacing-xs': '0.25rem',
  'chips-spacing-sm': '0.5rem',
  'chips-spacing-md': '1rem',
  'chips-spacing-lg': '1.5rem',
  'chips-spacing-xl': '2rem',
  'chips-radius-sm': '0.25rem',
  'chips-radius-md': '0.5rem',
  'chips-radius-lg': '0.75rem',
  'chips-font-family': 'Inter, "Noto Sans SC", system-ui, sans-serif',
  'chips-font-size-xs': '0.75rem',
  'chips-font-size-sm': '0.875rem',
  'chips-font-size-base': '1rem',
  'chips-font-size-lg': '1.125rem',
  'chips-font-weight-normal': '400',
  'chips-font-weight-medium': '500',
  'chips-font-weight-semibold': '600',
  'chips-duration-fast': '100ms',
  'chips-duration-normal': '200ms',
  'chips-easing-default': 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export const themeTokens: Record<ThemeType, TokenBag> = {
  'default-light': {
    ...commonTokens,
    'chips-color-primary': '#3b82f6',
    'chips-color-secondary': '#6366f1',
    'chips-color-background': '#ffffff',
    'chips-color-surface': '#f8fafc',
    'chips-color-text': '#1e293b',
    'chips-color-text-secondary': '#64748b',
    'chips-color-border': '#e2e8f0',
    'chips-color-error': '#ef4444',
    'chips-color-success': '#22c55e',
    'chips-color-warning': '#f59e0b',
  },
  'default-dark': {
    ...commonTokens,
    'chips-color-primary': '#60a5fa',
    'chips-color-secondary': '#818cf8',
    'chips-color-background': '#0f172a',
    'chips-color-surface': '#1e293b',
    'chips-color-text': '#f1f5f9',
    'chips-color-text-secondary': '#94a3b8',
    'chips-color-border': '#334155',
    'chips-color-error': '#f87171',
    'chips-color-success': '#4ade80',
    'chips-color-warning': '#fbbf24',
  },
};

export const themeDefaults = themeTokens['default-light'];
