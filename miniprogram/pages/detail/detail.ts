import { api } from '../../utils/request';

Page({
  data: { prompt: null as any, comments: [] as any[], commentText: '' },
  onLoad(options: any) {
    if (options.id) this.fetchDetail(options.id);
  },
  async fetchDetail(id: string) {
    try {
      const prompt = await api.get(`/prompts/${id}`);
      this.setData({ prompt });
      const comments = await api.get('/comments', { targetType: 'prompt', targetId: id });
      this.setData({ comments: comments.items });
    } catch { /* handled */ }
  },
  onCopy() {
    wx.setClipboardData({ data: this.data.prompt?.content || '' });
    api.post(`/prompts/${this.data.prompt?.id}/copy`);
  },
  async onFavorite() {
    await api.post('/user/favorites', { targetType: 'prompt', targetId: this.data.prompt?.id });
    wx.showToast({ title: '已收藏', icon: 'success' });
  },
});
