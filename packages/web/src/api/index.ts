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

/**
 * 提取后端错误信息（兼容字符串/数组格式）
 */
export function extractError(error: any): string {
  const data = error?.response?.data;
  const msg = data?.message;
  if (Array.isArray(msg)) return msg.join('；');
  if (typeof msg === 'string' && msg) return msg;
  // 网络错误
  if (!error.response) {
    if (error.code === 'ECONNABORTED') return '请求超时，请稍后再试';
    return '网络异常，请检查网络连接';
  }
  // HTTP 状态码兜底
  const statusMap: Record<number, string> = {
    400: '请求参数有误',
    401: '登录已过期，请重新登录',
    403: '没有操作权限',
    404: '请求的资源不存在',
    429: '操作过于频繁，请稍后再试',
    500: '服务器开小差了，请稍后再试',
    502: '服务暂时不可用',
    503: '服务维护中',
  };
  return statusMap[error.response.status] || '请求失败，请稍后再试';
}

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
