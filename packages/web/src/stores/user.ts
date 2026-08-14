import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api';

export const useUserStore = defineStore('user', () => {
  const user = ref<any>(null);
  const token = ref(localStorage.getItem('accessToken') || '');
  const inited = ref(false);

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'super_admin');

  async function init() {
    if (token.value) {
      try {
        user.value = await api.get('/user/profile');
      } catch { logout(); }
    }
    inited.value = true;
  }

  async function login(account: string, password: string) {
    // 含 @ 按邮箱，否则按用户名
    const payload = account.includes('@') ? { email: account, password } : { username: account, password };
    const res = await api.post('/auth/login', payload);
    token.value = res.accessToken;
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    user.value = await api.get('/user/profile');
  }

  async function register(username: string, email: string, password: string) {
    const res = await api.post('/auth/register', { username, email, password });
    token.value = res.accessToken;
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    user.value = await api.get('/user/profile');
  }

  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  return { user, token, inited, isLoggedIn, isAdmin, init, login, register, logout };
});
