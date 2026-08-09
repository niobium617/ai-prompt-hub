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

// 响应拦截：提取 data + Token刷新
api.interceptors.response.use(
  res => res.data,  // 直接返回后端响应体
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshRes = await axios.post('/api/v1/auth/refresh', { refreshToken });
          const newToken = refreshRes.data.accessToken;
          localStorage.setItem('accessToken', newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        } catch { /* refresh failed */ }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
