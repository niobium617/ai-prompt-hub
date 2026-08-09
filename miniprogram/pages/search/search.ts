import { api } from '../../utils/request';

Page({
  data: {
    keyword: '',
    results: [] as any[],
    total: 0,
    suggestions: [] as any[],
    searched: false,
  },
  onLoad(options: any) {
    if (options.keyword) { this.setData({ keyword: options.keyword }); this.doSearch(); }
  },
  async doSearch() {
    if (!this.data.keyword.trim()) return;
    this.setData({ searched: true });
    try {
      const res: any = await api.get('/search', { keyword: this.data.keyword });
      this.setData({ results: res?.items || [], total: res?.total || 0 });
    } catch { }
  },
  goDetail(e: any) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` });
  },
});
