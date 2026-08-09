import { api } from '../../utils/request';

Page({
  data: {
    categories: [] as any[],
    catIndex: 0,
    title: '',
    description: '',
    content: '',
    difficulty: 1,
    selectedTools: [] as number[],
    submitting: false,
  },

  onLoad() {
    api.get('/categories').then((cats: any) => {
      const flat: any[] = [];
      (cats || []).forEach((c: any) => {
        flat.push({ name: c.name, id: c.id });
        (c.children || []).forEach((sub: any) => flat.push({ name: '  └ ' + sub.name, id: sub.id }));
      });
      this.setData({ categories: flat });
    });
  },

  onCatChange(e: any) { this.setData({ catIndex: e.detail.value }); },
  onDiffChange(e: any) { this.setData({ difficulty: parseInt(e.detail.value) + 1 }); },

  async onSubmit() {
    const { title, description, content, categories, catIndex, difficulty } = this.data;
    if (!title.trim() || !content.trim()) { wx.showToast({ title: '标题和内容必填', icon: 'none' }); return; }
    this.setData({ submitting: true });
    try {
      await api.post('/prompts', {
        title, description, content,
        categoryId: categories[catIndex]?.id,
        difficulty,
      });
      wx.showToast({ title: '提交成功，等待审核', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch { }
    this.setData({ submitting: false });
  },
});
