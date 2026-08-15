import { api } from '../../utils/request';

Page({
  data: {
    isLogin: false,
    userInfo: null as any,
    stats: { prompts: 0, favorites: 0, unread: 0 } as any,
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
      const [profile, favRes, promptRes, notifRes] = await Promise.all([
        api.get('/user/profile'),
        api.get('/user/favorites'),
        api.get('/user/prompts', { page: 1, pageSize: 1 }),
        api.get('/user/notifications', { page: 1, pageSize: 1 }),
      ]);
      this.setData({
        userInfo: profile as any,
        stats: {
          prompts: (promptRes as any)?.total || 0,
          favorites: (favRes as any)?.total || 0,
          unread: (notifRes as any)?.unreadCount || 0,
        },
      });
    } catch { /* not logged in */ }
  },

  goLogin() { wx.navigateTo({ url: '/pages/login/login' }); },
  goFavorites() { wx.navigateTo({ url: '/pages/favorites/favorites' }); },
  goMyPrompts() { wx.navigateTo({ url: '/pages/myprompts/myprompts' }); },
  goDrafts() { wx.navigateTo({ url: '/pages/drafts/drafts' }); },
  goNotifications() { wx.navigateTo({ url: '/pages/notifications/notifications' }); },
  goSubmit() { wx.navigateTo({ url: '/pages/submit/submit' }); },
  goTools() { wx.navigateTo({ url: '/pages/tools/tools' }); },

  logout() {
    wx.removeStorageSync('accessToken');
    wx.removeStorageSync('refreshToken');
    this.setData({ isLogin: false, userInfo: null });
    wx.showToast({ title: '已退出', icon: 'none' });
  },
});
