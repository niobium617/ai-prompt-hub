import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api';

export const useUserStore = defineStore('user', () => {
  const user = ref<any>(null);
  const token = ref(localStorage.getItem('accessToken') || '');

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'super_admin');

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    token.value = res.data.accessToken;
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    await fetchProfile();
  }

  async function register(username: string, email: string, password: string) {
    const res = await api.post('/auth/register', { username, email, password });
    token.value = res.data.accessToken;
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    await fetchProfile();
  }

  async function fetchProfile() {
    try {
      const res = await api.get('/user/profile');
      user.value = res.data;
    } catch { logout(); }
  }

  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  return { user, token, isLoggedIn, isAdmin, login, register, fetchProfile, logout };
});
