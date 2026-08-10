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
      const catList = cats || [];
      const firstId = catList.length > 0 ? catList[0].id : 0;
      this.setData({ categories: catList, selectedId: firstId });
      if (firstId > 0) this.fetchPrompts();
    });
  },

  onSelectCat(e: any) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.selectedId) return;
    this.setData({ selectedId: id });
    this.fetchPrompts();
  },

  async fetchPrompts() {
    if (!this.data.selectedId) return;
    this.setData({ loading: true, prompts: [] });
    try {
      const res: any = await api.get(`/categories/${this.data.selectedId}/prompts`);
      this.setData({ prompts: res ? res.items || [] : [], loading: false });
    } catch {
      this.setData({ prompts: [], loading: false });
    }
  },

  onTapPrompt(e: any) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },
});
