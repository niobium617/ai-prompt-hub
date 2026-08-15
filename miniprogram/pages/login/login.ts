import { api } from '../../utils/request';

Page({
  data: {
    mode: 'wechat' as 'wechat' | 'password' | 'register',
    // 密码登录
    email: '', password: '',
    // 注册
    username: '', regEmail: '', regPassword: '',
    // 微信绑定邮箱
    showBindDialog: false,
    bindEmail: '',
    bindToken: '',
    needVerify: false,
    verifyCode: '',
    loading: false,
  },

  switchMode(e: any) {
    this.setData({ mode: e.currentTarget.dataset.mode });
  },

  // 输入事件
  onEmail(e: any) { this.setData({ email: e.detail.value }); },
  onPwd(e: any) { this.setData({ password: e.detail.value }); },
  onUser(e: any) { this.setData({ username: e.detail.value }); },
  onRegEmail(e: any) { this.setData({ regEmail: e.detail.value }); },
  onRegPwd(e: any) { this.setData({ regPassword: e.detail.value }); },
  onBindEmailInput(e: any) { this.setData({ bindEmail: e.detail.value }); },
  onVerifyCodeInput(e: any) { this.setData({ verifyCode: e.detail.value }); },

  /** 微信一键登录 */
  async onWechatLogin() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      const loginRes: any = await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject });
      });
      const res: any = await api.post('/auth/login/wechat', { code: loginRes.code });
      if (res.needBindEmail) {
        // 新用户：弹出邮箱绑定
        this.setData({ showBindDialog: true, bindToken: res.bindToken });
      } else {
        this.saveLogin(res);
      }
    } catch (e: any) {
      wx.showToast({ title: e?.response?.data?.message || '登录失败', icon: 'none' });
    }
    this.setData({ loading: false });
  },

  /** 微信新用户确认绑定邮箱 */
  async onBindEmail() {
    const email = this.data.bindEmail.trim();
    if (!email || !email.includes('@')) {
      wx.showToast({ title: '请输入正确邮箱', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    try {
      const res: any = await api.post('/auth/wechat/bind', {
        bindToken: this.data.bindToken,
        email,
      });
      if (res.needVerify) {
        // 邮箱已注册：需要验证码验证身份
        this.setData({ needVerify: true, bindEmail: email });
        if (res.devCode) {
          // 开发模式：验证码未发邮件，直接展示
          this.setData({ verifyCode: res.devCode });
          wx.showModal({
            title: '开发模式验证码',
            content: '验证码: ' + res.devCode,
            showCancel: false,
          });
        } else {
          wx.showToast({ title: '验证码已发送到邮箱', icon: 'none' });
        }
      } else {
        this.setData({ showBindDialog: false });
        this.saveLogin(res);
      }
    } catch (e: any) {
      wx.showToast({ title: e?.response?.data?.message || '绑定失败', icon: 'none' });
    }
    this.setData({ loading: false });
  },

  /** 已注册邮箱：输入验证码完成绑定 */
  async onVerifyBind() {
    if (!this.data.verifyCode) {
      wx.showToast({ title: '请输入验证码', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    try {
      const res: any = await api.post('/auth/wechat/bind', {
        bindToken: this.data.bindToken,
        email: this.data.bindEmail,
        code: this.data.verifyCode,
      });
      this.setData({ showBindDialog: false, needVerify: false });
      this.saveLogin(res);
    } catch (e: any) {
      wx.showToast({ title: e?.response?.data?.message || '验证失败', icon: 'none' });
    }
    this.setData({ loading: false });
  },

  /** 保存登录态并跳转 */
  saveLogin(res: any) {
    wx.setStorageSync('accessToken', res.accessToken);
    wx.setStorageSync('refreshToken', res.refreshToken);
    wx.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1000);
  },

  /** 邮箱密码登录 */
  async onLogin() {
    const { email, password } = this.data;
    if (!email || !password) { wx.showToast({ title: '请填写完整', icon: 'none' }); return; }
    this.setData({ loading: true });
    try {
      const res: any = await api.post('/auth/login', { email, password });
      this.saveLogin(res);
    } catch (e: any) {
      wx.showToast({ title: e?.response?.data?.message || '登录失败', icon: 'none' });
    }
    this.setData({ loading: false });
  },

  /** 注册 */
  async onRegister() {
    const { username, regEmail, regPassword } = this.data;
    if (!username || !regEmail || !regPassword) { wx.showToast({ title: '请填写完整', icon: 'none' }); return; }
    this.setData({ loading: true });
    try {
      const res: any = await api.post('/auth/register', { username, email: regEmail, password: regPassword, nickname: username });
      this.saveLogin(res);
    } catch (e: any) {
      wx.showToast({ title: e?.response?.data?.message || '注册失败', icon: 'none' });
    }
    this.setData({ loading: false });
  },
});
