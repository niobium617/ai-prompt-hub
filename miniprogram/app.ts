/**
 * AI Prompt Hub
 * 版权 (C) 2026 niobium617 — 仅供个人学习，禁止商用
 * 详情见 LICENSE 文件
 */

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
