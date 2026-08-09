Page({
  data: { token: '' },
  onShow() {
    this.setData({ token: wx.getStorageSync('accessToken') || '' });
  },
  onLogin() { wx.navigateTo({ url: '/pages/login/login' }); },
  onLogout() {
    wx.removeStorageSync('accessToken');
    wx.removeStorageSync('refreshToken');
    this.setData({ token: '' });
    wx.showToast({ title: '已退出', icon: 'none' });
  },
});
