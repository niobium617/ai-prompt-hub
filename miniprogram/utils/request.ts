const BASE_URL = 'http://localhost:3000/api/v1';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: any;
}

function request<T = any>(options: RequestOptions): Promise<T> {
  const token = wx.getStorageSync('accessToken') || '';

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      success(res: any) {
        // 200: 直接返回 data（后端无统一包装层）
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data as T);
          return;
        }
        // 401: Token 过期
        if (res.statusCode === 401) {
          const refreshToken = wx.getStorageSync('refreshToken');
          if (refreshToken) {
            wx.request({
              url: BASE_URL + '/auth/refresh',
              method: 'POST',
              data: { refreshToken },
              success(r: any) {
                if (r.statusCode === 200 && r.data.accessToken) {
                  wx.setStorageSync('accessToken', r.data.accessToken);
                  request<T>(options).then(resolve).catch(reject);
                } else {
                  wx.removeStorageSync('accessToken');
                  wx.removeStorageSync('refreshToken');
                  wx.redirectTo({ url: '/pages/login/login' });
                  reject(r.data);
                }
              },
              fail: reject,
            });
          } else {
            wx.removeStorageSync('accessToken');
            wx.removeStorageSync('refreshToken');
            wx.redirectTo({ url: '/pages/login/login' });
            reject(res.data);
          }
          return;
        }
        // 其他错误
        wx.showToast({ title: (res.data as any)?.message || '请求失败', icon: 'none' });
        reject(res.data);
      },
      fail(err) {
        wx.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      },
    });
  });
}

export const api = {
  get: <T = any>(url: string, params?: any) => {
    let query = '';
    if (params) {
      const qs = Object.keys(params)
        .filter(k => params[k] !== undefined && params[k] !== null)
        .map(k => `${k}=${encodeURIComponent(params[k])}`)
        .join('&');
      if (qs) query = '?' + qs;
    }
    return request<T>({ url: url + query, method: 'GET' });
  },
  post: <T = any>(url: string, data?: any) => request<T>({ url, method: 'POST', data }),
  put: <T = any>(url: string, data?: any) => request<T>({ url, method: 'PUT', data }),
  delete: <T = any>(url: string, data?: any) => request<T>({ url, method: 'DELETE', data }),
};
