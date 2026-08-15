import { api } from '../../utils/request';

Page({
  data: {
    prompt: null as any,
    comments: [] as any[],
    commentText: '',
    isFav: false,
    userRating: 0,
    creatingDraft: false,
  },

  onLoad(options: any) {
    if (options.id) this.fetchDetail(Number(options.id));
  },

  async fetchDetail(id: number) {
    try {
      const p = await api.get(`/prompts/${id}`);
      this.setData({ prompt: p });
      const c = await api.get('/comments', { targetType: 'prompt', targetId: id });
      this.setData({ comments: (c as any)?.items || [] });
    } catch { }
  },

  onCopy() {
    if (!this.data.prompt?.content) return;
    wx.setClipboardData({ data: this.data.prompt.content });
    api.post(`/prompts/${this.data.prompt.id}/copy`);
    wx.showToast({ title: '已复制', icon: 'success' });
  },

  /** 基于此创建草稿 */
  async onCreateDraft() {
    if (!wx.getStorageSync('accessToken')) {
      wx.showToast({ title: '请先登录', icon: 'none' }); return;
    }
    if (this.data.creatingDraft) return;
    this.setData({ creatingDraft: true });
    try {
      const draft: any = await api.post('/drafts', { sourcePromptId: this.data.prompt.id });
      wx.showToast({ title: '草稿已创建', icon: 'success' });
      setTimeout(() => {
        wx.navigateTo({ url: `/pages/draftedit/draftedit?id=${draft.id}` });
      }, 600);
    } catch { }
    this.setData({ creatingDraft: false });
  },

  async onFav() {
    if (!wx.getStorageSync('accessToken')) {
      wx.showToast({ title: '请先登录', icon: 'none' }); return;
    }
    const id = this.data.prompt?.id;
    try {
      await api.post('/user/favorites', { targetType: 'prompt', targetId: id });
      this.setData({ isFav: true });
      wx.showToast({ title: '已收藏', icon: 'success' });
    } catch { }
  },

  async onRate(e: any) {
    const score = e.currentTarget.dataset.score;
    if (!wx.getStorageSync('accessToken')) { wx.showToast({ title: '请先登录', icon: 'none' }); return; }
    try {
      await api.post(`/prompts/${this.data.prompt.id}/rate`, { score });
      this.setData({ userRating: score });
      wx.showToast({ title: '评分成功', icon: 'success' });
    } catch { }
  },

  async onSubmitComment() {
    if (!this.data.commentText.trim()) return;
    if (!wx.getStorageSync('accessToken')) { wx.showToast({ title: '请先登录', icon: 'none' }); return; }
    try {
      await api.post('/comments', { targetType: 'prompt', targetId: this.data.prompt.id, content: this.data.commentText });
      this.setData({ commentText: '' });
      wx.showToast({ title: '评论成功', icon: 'success' });
      this.fetchDetail(this.data.prompt.id);
    } catch { }
  },
});
