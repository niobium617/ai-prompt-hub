import { api } from '../../utils/request';

Page({
  data: {
    searchKeyword: '',
    banners: [
      { title: '发现高质量AI提示词', desc: '汇集最实用的Prompt' },
    ],
    categories: [] as any[],
    hotPrompts: [] as any[],
    featuredPrompts: [] as any[],
  },

  onLoad() {
    this.fetchData();
  },

  onPullDownRefresh() {
    this.fetchData().then(() => wx.stopPullDownRefresh());
  },

  async fetchData() {
    try {
      const [hotRes, featRes, catRes] = await Promise.all([
        api.get('/prompts/hot', { limit: 6 }),
        api.get('/prompts/featured', { limit: 6 }),
        api.get('/categories'),
      ]);
      this.setData({ hotPrompts: hotRes, featuredPrompts: featRes, categories: catRes });
    } catch { /* error handled in request */ }
  },

  onSearch() {
    if (this.data.searchKeyword.trim()) {
      wx.navigateTo({ url: `/pages/search/search?keyword=${this.data.searchKeyword}` });
    }
  },

  onTapCategory(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.switchTab({ url: `/pages/category/category?id=${id}` });
  },

  onTapPrompt(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },
});
