// app.ts
App<IAppOption>({
  globalData: {
    token: '',
    userInfo: null,
  },

  onLaunch() {
    // 检查登录态
    const token = wx.getStorageSync('accessToken');
    if (token) {
      this.globalData.token = token;
    }
  },
});
