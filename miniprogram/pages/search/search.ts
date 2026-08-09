import { api } from '../../utils/request';

Page({
  data: { keyword: '', prompts: [] as any[], suggestions: [] as any[], total: 0, searched: false },
  onLoad(options: any) {
    if (options.keyword) { this.setData({ keyword: options.keyword }); this.doSearch(); }
  },
  async doSearch() {
    if (!this.data.keyword.trim()) return;
    this.setData({ searched: true });
    const res = await api.get('/search', { keyword: this.data.keyword });
    this.setData({ prompts: res.items, total: res.total });
  },
  onInput(e: any) {
    const keyword = e.detail.value;
    this.setData({ keyword });
    if (keyword) api.get('/search/suggestions', { keyword }).then(r => this.setData({ suggestions: r }));
    else this.setData({ suggestions: [] });
  },
});
