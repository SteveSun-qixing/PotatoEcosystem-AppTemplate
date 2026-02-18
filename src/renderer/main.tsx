/**
 * 渲染进程入口
 * @module renderer/main
 * @description React 应用入口
 */

import { createRoot } from 'react-dom/client';
import App from './App';
import { AppStoreProvider } from './state/app-store';
import './styles/app.css';
import './styles/panel-common.css';

const container = document.getElementById('app');

if (!container) {
  throw new Error('App root container (#app) not found');
}

const root = createRoot(container);

root.render(
  <AppStoreProvider>
    <App />
  </AppStoreProvider>,
);
