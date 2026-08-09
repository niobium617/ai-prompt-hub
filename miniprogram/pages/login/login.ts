import { api } from '../../utils/request';

Page({
  data: {
    mode: 'login' as 'login' | 'register',
    email: '', password: '',
    username: '', regEmail: '', regPassword: '',
    loading: false,
  },

  switchMode(e: any) { this.setData({ mode: e.currentTarget.dataset.mode }); },

  async onLogin() {
    const { email, password } = this.data;
    if (!email || !password) { wx.showToast({ title: '请填写完整', icon: 'none' }); return; }
    this.setData({ loading: true });
    try {
      const res: any = await api.post('/auth/login', { email, password });
      wx.setStorageSync('accessToken', res.accessToken);
      wx.setStorageSync('refreshToken', res.refreshToken);
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1000);
    } catch { }
    this.setData({ loading: false });
  },

  async onRegister() {
    const { username, regEmail, regPassword } = this.data;
    if (!username || !regEmail || !regPassword) { wx.showToast({ title: '请填写完整', icon: 'none' }); return; }
    this.setData({ loading: true });
    try {
      const res: any = await api.post('/auth/register', { username, email: regEmail, password: regPassword, nickname: username });
      wx.setStorageSync('accessToken', res.accessToken);
      wx.setStorageSync('refreshToken', res.refreshToken);
      wx.showToast({ title: '注册成功', icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1000);
    } catch { }
    this.setData({ loading: false });
  },
});
