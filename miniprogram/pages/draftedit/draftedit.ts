import { api } from '../../utils/request';

Page({
  data: {
    draftId: 0,
    source: null as any,
    draft: null as any,
    title: '',
    description: '',
    content: '',
    // view: draft 草稿 / source 原始
    view: 'draft',
    saving: false,
  },

  onLoad(options: any) {
    if (options.id) {
      this.setData({ draftId: Number(options.id) });
      this.fetchDraft();
    }
  },

  async fetchDraft() {
    try {
      const res: any = await api.get(`/drafts/${this.data.draftId}`);
      this.setData({
        source: res.source,
        draft: res.draft,
        title: res.draft.title,
        description: res.draft.description,
        content: res.draft.content,
      });
    } catch { }
  },

  switchView(e: any) {
    this.setData({ view: e.currentTarget.dataset.view });
  },

  onTitleInput(e: any) { this.setData({ title: e.detail.value }); },
  onDescInput(e: any) { this.setData({ description: e.detail.value }); },
  onContentInput(e: any) { this.setData({ content: e.detail.value }); },

  async onSave() {
    if (!this.data.title.trim()) {
      wx.showToast({ title: '标题不能为空', icon: 'none' });
      return;
    }
    this.setData({ saving: true });
    try {
      await api.put(`/drafts/${this.data.draftId}`, {
        title: this.data.title,
        description: this.data.description,
        content: this.data.content,
      });
      wx.showToast({ title: '已保存', icon: 'success' });
    } catch { }
    this.setData({ saving: false });
  },

  onDelete() {
    wx.showModal({
      title: '删除草稿',
      content: '确认删除？删除后不可恢复',
      confirmText: '删除',
      confirmColor: '#ef4444',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await api.delete(`/drafts/${this.data.draftId}`);
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 600);
        } catch { }
      },
    });
  },
});
