import { api } from '../../utils/request';

Page({
  data: { categories: [] as any[], selectedId: 0, prompts: [] as any[], loading: false },
  onLoad() {
    api.get('/categories').then(cats => this.setData({ categories: cats, selectedId: cats[0]?.id || 0 }));
    this.fetchPrompts();
  },
  onSelectCat(e: any) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedId: id });
    this.fetchPrompts();
  },
  async fetchPrompts() {
    this.setData({ loading: true });
    const res = await api.get(`/categories/${this.data.selectedId}/prompts`);
    this.setData({ prompts: res.items, loading: false });
  },
});
