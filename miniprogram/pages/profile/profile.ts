const app = getApp<IAppOption>();

Page({
  data: {
    isLogin: false,
    userInfo: null as any,
    stats: { prompts: 0, favorites: 0 } as any,
  },

  onShow() {
    const token = wx.getStorageSync('accessToken');
    if (token) {
      this.setData({ isLogin: true });
      this.loadProfile();
    } else {
      this.setData({ isLogin: false, userInfo: null });
    }
  },

  async loadProfile() {
    try {
      const { api } = require('../../utils/request');
      const [profile, favRes] = await Promise.all([
        api.get('/user/profile'),
        api.get('/user/favorites'),
      ]);
      this.setData({
        userInfo: profile as any,
        stats: {
          prompts: (profile as any)?.points || 0,
          favorites: (favRes as any)?.total || 0,
        },
      });
    } catch { /* not logged in */ }
  },

  goLogin() { wx.navigateTo({ url: '/pages/login/login' }); },
  goFavorites() { wx.navigateTo({ url: '/pages/favorites/favorites' }); },
  goSubmit() { wx.navigateTo({ url: '/pages/submit/submit' }); },
  goTools() { wx.navigateTo({ url: '/pages/tools/tools' }); },

  logout() {
    wx.removeStorageSync('accessToken');
    wx.removeStorageSync('refreshToken');
    this.setData({ isLogin: false, userInfo: null });
    wx.showToast({ title: '已退出', icon: 'none' });
  },
});
