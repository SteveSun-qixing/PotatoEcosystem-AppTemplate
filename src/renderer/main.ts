/**
 * 渲染进程入口
 * @module renderer/main
 * @description Vue 3 应用入口，初始化 Pinia 状态管理
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount('#app');
