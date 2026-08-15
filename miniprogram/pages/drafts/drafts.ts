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
});
