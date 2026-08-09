import { api } from '../../utils/request';

Page({
  data: { email: '', password: '', loading: false },
  async onLogin() {
    if (!this.data.email || !this.data.password) return wx.showToast({ title: '请填写完整', icon: 'none' });
    this.setData({ loading: true });
    try {
      const res = await api.post('/auth/login', { email: this.data.email, password: this.data.password });
      wx.setStorageSync('accessToken', (res as any).accessToken);
      wx.setStorageSync('refreshToken', (res as any).refreshToken);
      wx.switchTab({ url: '/pages/index/index' });
    } catch { /* handled */ }
    this.setData({ loading: false });
  },
});
