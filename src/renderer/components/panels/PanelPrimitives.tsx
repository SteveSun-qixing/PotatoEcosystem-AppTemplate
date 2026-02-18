import { Button } from '@chips/components';
import type { ReactNode } from 'react';
import { t } from '../../services/i18n-service';
import type { TestResult } from '../../types';

interface PanelAction {
  key: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'run' | 'ghost';
}

interface PanelHeaderProps {
  title: string;
  description: string;
  actions: PanelAction[];
}

interface InfoBannerProps {
  icon: string;
  text: string;
}

interface PanelResultsProps {
  results: TestResult[];
}

export function PanelHeader({ title, description, actions }: PanelHeaderProps) {
  return (
    <div className="panel-header">
      <h3 className="panel-title">{title}</h3>
      <p className="panel-desc">{description}</p>
      <div className="panel-actions">
        {actions.map((action) => (
          <Button
            key={action.key}
            className={action.variant === 'ghost' ? 'ghost-btn' : 'run-btn'}
            disabled={action.disabled}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function InfoBanner({ icon, text }: InfoBannerProps) {
  return (
    <div className="info-banner">
      <span className="banner-icon" aria-hidden>
        {icon}
      </span>
      <span className="banner-text">{text}</span>
    </div>
  );
}

export function PanelResults({ results }: PanelResultsProps) {
  if (results.length === 0) {
    return (
      <div className="panel-results">
        <p className="no-results">{t('test.pending')}</p>
      </div>
    );
  }

  return (
    <div className="panel-results">
      {results.map((result) => (
        <div key={result.name} className="result-item">
          <span className={`result-status ${result.passed ? 'pass' : 'fail'}`}>
            {result.passed ? t('test.pass') : t('test.fail')}
          </span>
          <span className="result-name">{result.name}</span>
          <span className="result-message">{result.message}</span>
          {result.duration !== undefined ? (
            <span className="result-duration">
              {result.duration}
              {t('test.ms')}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function PanelShell({ children }: { children: ReactNode }) {
  return <div className="test-panel">{children}</div>;
}
