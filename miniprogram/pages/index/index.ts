import { api } from '../../utils/request';

const app = getApp<IAppOption>();

Page({
  data: {
    keyword: '',
    categories: [] as any[],
    hotPrompts: [] as any[],
    featuredPrompts: [] as any[],
  },

  onLoad() { this.fetchData(); },
  onShow() { this.fetchData(); },
  onPullDownRefresh() { this.fetchData().then(() => wx.stopPullDownRefresh()); },

  async fetchData() {
    try {
      const [hot, feat, cats] = await Promise.all([
        api.get('/prompts/hot', { limit: 6 }),
        api.get('/prompts/featured', { limit: 6 }),
        api.get('/categories'),
      ]);
      this.setData({ hotPrompts: hot as any[], featuredPrompts: feat as any[], categories: cats as any[] });
    } catch { /* handled in request */ }
  },

  onSearch() {
    const kw = this.data.keyword.trim();
    if (kw) wx.navigateTo({ url: `/pages/search/search?keyword=${kw}` });
  },

  goCategory(e: any) {
    wx.switchTab({ url: '/pages/category/category' });
  },

  goDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  goTools() {
    wx.navigateTo({ url: '/pages/tools/tools' });
  },
});
