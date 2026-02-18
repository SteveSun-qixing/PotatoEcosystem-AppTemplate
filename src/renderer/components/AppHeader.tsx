import { Dialog, Select, Switch } from '@chips/components';
import { useMemo } from 'react';
import { t } from '../services/i18n-service';
import type { Locale, ThemeType } from '../types';

interface AppHeaderProps {
  locale: Locale;
  theme: ThemeType;
  onLocaleChange: (locale: Locale) => void;
  onThemeToggle: (darkMode: boolean) => void;
}

export default function AppHeader({
  locale,
  theme,
  onLocaleChange,
  onThemeToggle,
}: AppHeaderProps) {
  const isMac = useMemo(
    () => typeof window !== 'undefined' && window.electronAPI?.platform === 'darwin',
    [],
  );

  return (
    <header className={`app-header ${isMac ? 'is-mac' : ''}`}>
      {isMac ? <div className="traffic-light-spacer" /> : null}

      <div className="header-title">
        <h1 className="title-text">{t('app.title')}</h1>
        <p className="title-subtext">{t('app.subtitle')}</p>
      </div>

      <div className="header-actions">
        <Select
          chipsScope="header-locale"
          className="locale-select"
          label={t('status.locale')}
          value={locale}
          options={[
            { label: t('header.lang_zh'), value: 'zh-CN' },
            { label: t('header.lang_en'), value: 'en-US' },
          ]}
          onValueChange={(value) => {
            if (value === 'zh-CN' || value === 'en-US') {
              onLocaleChange(value);
            }
          }}
        />

        <Switch
          chipsScope="header-theme"
          checked={theme === 'default-dark'}
          onCheckedChange={onThemeToggle}
        >
          {theme === 'default-dark' ? t('header.theme_dark') : t('header.theme_light')}
        </Switch>

        <Dialog
          chipsScope="header-settings"
          trigger={<span className="header-btn dialog-trigger">{t('header.settings')}</span>}
          title={t('header.settings')}
          description={t('app.subtitle')}
        >
          <div className="settings-dialog-content">
            <p>
              {t('status.locale')}: {locale}
            </p>
            <p>
              {t('status.theme')}: {theme}
            </p>
            <p>
              {t('status.sdk_state')}: {t('status.ready')}
            </p>
          </div>
        </Dialog>
      </div>
    </header>
  );
}
