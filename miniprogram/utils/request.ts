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
        if (res.data.code === 0) {
          resolve(res.data.data);
        } else if (res.data.code === 40100) {
          // Token过期，触发刷新
          const refreshToken = wx.getStorageSync('refreshToken');
          if (refreshToken) {
            wx.request({
              url: BASE_URL + '/auth/refresh',
              method: 'POST',
              data: { refreshToken },
              success(r: any) {
                if (r.data.code === 0) {
                  wx.setStorageSync('accessToken', r.data.data.accessToken);
                  // 重试原请求
                  request(options).then(resolve).catch(reject);
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
            wx.redirectTo({ url: '/pages/login/login' });
            reject(res.data);
          }
        } else {
          wx.showToast({ title: res.data.message || '请求失败', icon: 'none' });
          reject(res.data);
        }
      },
      fail(err) {
        wx.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      },
    });
  });
}

export const api = {
  get: <T = any>(url: string, data?: any) => request<T>({ url, method: 'GET', data }),
  post: <T = any>(url: string, data?: any) => request<T>({ url, method: 'POST', data }),
  put: <T = any>(url: string, data?: any) => request<T>({ url, method: 'PUT', data }),
  delete: <T = any>(url: string, data?: any) => request<T>({ url, method: 'DELETE', data }),
};
