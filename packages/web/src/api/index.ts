import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const client: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截：注入Token
client.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截：提取 data + Token刷新
client.interceptors.response.use(
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
          return client(original);
        } catch { /* refresh failed */ }
      }
    }
    return Promise.reject(error);
  },
);

// 类型安全的包装：返回后端数据（any），避免 AxiosResponse 类型干扰
const api = {
  get: <T = any>(url: string, params?: any): Promise<T> =>
    client.get(url, { params }) as unknown as Promise<T>,
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    client.post(url, data, config) as unknown as Promise<T>,
  put: <T = any>(url: string, data?: any): Promise<T> =>
    client.put(url, data) as unknown as Promise<T>,
  delete: <T = any>(url: string, data?: any): Promise<T> =>
    client.delete(url, { data }) as unknown as Promise<T>,
};

export default api;
