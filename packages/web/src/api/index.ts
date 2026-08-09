import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截：注入Token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截：统一错误处理 + Token刷新
api.interceptors.response.use(
  res => res.data,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/v1/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', res.data.data.accessToken);
          original.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
          return api(original);
        } catch { /* refresh failed */ }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
