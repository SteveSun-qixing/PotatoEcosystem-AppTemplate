import { t } from '../services/i18n-service';
import { useAppStore } from '../state/app-store';

export default function StatusBar() {
  const appStore = useAppStore();

  const sdkStateText = appStore.sdkReady ? t('status.ready') : t('status.loading');
  const connectionText = t(`status.${appStore.connectionState}`);

  return (
    <footer className="status-bar">
      <div className="status-item">
        <span className="status-label">{t('status.sdk_state')}:</span>
        <span className={`status-value ${appStore.sdkReady ? 'success' : ''}`}>{sdkStateText}</span>
      </div>

      <div className="status-item">
        <span className="status-label">{t('status.connection')}:</span>
        <span className="status-value">{connectionText}</span>
      </div>

      <div className="status-item">
        <span className="status-label">{t('status.locale')}:</span>
        <span className="status-value">{appStore.locale}</span>
      </div>

      <div className="status-item">
        <span className="status-label">{t('status.theme')}:</span>
        <span className="status-value">{appStore.theme}</span>
      </div>
    </footer>
  );
}
