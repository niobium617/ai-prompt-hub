import { api } from '../../utils/request';

Page({
  data: {
    tags: [] as any[],
    hotPrompts: [] as any[],
    newPrompts: [] as any[],
  },

  onShow() {
    Promise.all([
      api.get('/tags/hot', { limit: 20 }),
      api.get('/prompts/hot', { limit: 10 }),
      api.get('/prompts', { pageSize: 6, sort: 'newest' }),
    ]).then(([tags, hot, news]: any[]) => {
      this.setData({ tags, hotPrompts: hot, newPrompts: news?.items || [] });
    });
  },

  goDetail(e: any) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` });
  },
  goSearch(e: any) {
    wx.navigateTo({ url: `/pages/search/search?keyword=${e.currentTarget.dataset.tag}` });
  },

});
