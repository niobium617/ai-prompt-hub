import { api } from '../../utils/request';

Page({
  data: {
    prompts: [] as any[],
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: false,
    loading: false,
  },

  onShow() {
    this.setData({ page: 1 });
    this.fetchPrompts(true);
  },

  async fetchPrompts(reset = false) {
    const page = reset ? 1 : this.data.page;
    this.setData({ loading: true });
    try {
      const res: any = await api.get('/user/prompts', { page, pageSize: this.data.pageSize });
      const items = res ? (res.items || []) : [];
      const prompts = reset ? items : this.data.prompts.concat(items);
      this.setData({
        prompts,
        page,
        total: res ? (res.total || 0) : 0,
        hasMore: prompts.length < (res ? (res.total || 0) : 0),
        loading: false,
      });
    } catch {
      this.setData({ loading: false });
    }
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.fetchPrompts(false);
    }
  },

  onPullDownRefresh() {
    this.fetchPrompts(true).then(() => wx.stopPullDownRefresh());
  },

  onTapPrompt(e: any) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  goSubmit() {
    wx.navigateTo({ url: '/pages/submit/submit' });
  },

  /** 删除自己的投稿（无需通知） */
  onDelete(e: any) {
    const { id, title } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除提示词',
      content: `确认删除《${title}》？删除后不可恢复`,
      confirmText: '删除',
      confirmColor: '#ef4444',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await api.delete(`/prompts/${id}`);
          wx.showToast({ title: '已删除', icon: 'success' });
          this.setData({ page: 1 });
          this.fetchPrompts(true);
        } catch {
          /* 错误已在请求层提示 */
        }
      },
    });
  },
});
