import { api } from '../../utils/request';

Page({
  data: {
    categories: [] as any[],
    selectedId: 0,
    prompts: [] as any[],
    loading: false,
  },

  onLoad() {
    api.get('/categories').then((cats: any) => {
      const catList = Array.isArray(cats) ? cats : [];
      this.setData({ categories: catList });
      this.fetchPrompts();
    });
  },

  onSelectCat(e: any) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedId: id });
    this.fetchPrompts();
  },

  async fetchPrompts() {
    this.setData({ loading: true, prompts: [] });
    try {
      let res: any;
      if (this.data.selectedId > 0) {
        // 按分类加载
        res = await api.get(`/categories/${this.data.selectedId}/prompts`);
      } else {
        // 全部
        res = await api.get('/prompts', { pageSize: 50 });
      }
      const items = res ? (res.items || []) : [];
      this.setData({ prompts: items, loading: false });
    } catch {
      this.setData({ prompts: [], loading: false });
    }
  },

  onTapPrompt(e: any) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },
});
