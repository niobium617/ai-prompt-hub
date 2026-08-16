/**
 * AI Prompt Hub
 * 版权 (C) 2026 niobium617 — 仅供个人学习，禁止商用
 * 详情见 LICENSE 文件
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useUserStore } from './stores/user';
import './styles/main.css';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

// 恢复登录态
const userStore = useUserStore();
userStore.init().then(() => {
  app.mount('#app');
});
