import { api } from '../../utils/request';

Page({
  data: {
    drafts: [] as any[],
    loading: false,
  },

  onShow() {
    this.fetchList();
  },

  async fetchList() {
    this.setData({ loading: true });
    try {
      const res: any = await api.get('/drafts', { page: 1, pageSize: 50 });
      this.setData({ drafts: res ? (res.items || []) : [], loading: false });
    } catch {
      this.setData({ loading: false });
    }
  },

  goEdit(e: any) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: `/pages/draftedit/draftedit?id=${id}` });
  },

  onDelete(e: any) {
    const { id, title } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除草稿',
      content: `确认删除《${title}》？删除后不可恢复`,
      confirmText: '删除',
      confirmColor: '#ef4444',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await api.delete(`/drafts/${id}`);
          wx.showToast({ title: '已删除', icon: 'success' });
          this.fetchList();
        } catch { }
      },
    });
  },
});
