import { api } from '../../utils/request';

Page({
  data: {
    items: [] as any[],
    unread: 0,
    loading: false,
  },

  onShow() {
    this.fetchList();
  },

  async fetchList() {
    this.setData({ loading: true });
    try {
      const res: any = await api.get('/user/notifications', { page: 1, pageSize: 50 });
      this.setData({
        items: res ? (res.items || []) : [],
        unread: res ? (res.unreadCount || 0) : 0,
        loading: false,
      });
    } catch {
      this.setData({ loading: false });
    }
  },

  async markAll() {
    await api.post('/user/notifications/read');
    wx.showToast({ title: '已全部标记为已读', icon: 'success' });
    this.fetchList();
  },
});
