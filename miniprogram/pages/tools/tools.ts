import { api } from '../../utils/request';

Page({
  data: {
    tab: 'generator' as 'generator' | 'optimizer',
    // Generator
    categories: [] as any[],
    selectedCat: '',
    description: '',
    selectedTool: '通用AI',
    genResult: null as any,
    genLoading: false,
    // Optimizer
    originalPrompt: '',
    optStyle: 'professional',
    optTool: '通用AI',
    optResult: null as any,
    optLoading: false,
  },

  onLoad() {
    api.get('/categories').then((cats: any) => {
      this.setData({ categories: cats, selectedCat: cats[0]?.name || '' });
    });
  },

  switchTab(e: any) {
    this.setData({ tab: e.currentTarget.dataset.tab });
  },

  // Generator
  async onGenerate() {
    if (!this.data.description.trim()) { wx.showToast({ title: '请输入需求', icon: 'none' }); return; }
    this.setData({ genLoading: true });
    try {
      const res: any = await api.post('/tools/prompt-generator', {
        category: this.data.selectedCat,
        description: this.data.description,
        toolName: this.data.selectedTool,
        style: 'detailed',
      });
      this.setData({ genResult: res });
    } catch { }
    this.setData({ genLoading: false });
  },

  copyGen() {
    if (!this.data.genResult) return;
    wx.setClipboardData({ data: this.data.genResult.prompt });
    wx.showToast({ title: '已复制', icon: 'success' });
  },

  // Optimizer
  async onOptimize() {
    if (!this.data.originalPrompt.trim()) { wx.showToast({ title: '请输入原始Prompt', icon: 'none' }); return; }
    this.setData({ optLoading: true });
    try {
      const res: any = await api.post('/tools/prompt-optimizer', {
        originalPrompt: this.data.originalPrompt,
        style: this.data.optStyle,
        targetTool: this.data.optTool,
      });
      this.setData({ optResult: res });
    } catch { }
    this.setData({ optLoading: false });
  },

  copyOpt() {
    if (!this.data.optResult) return;
    wx.setClipboardData({ data: this.data.optResult.optimized });
    wx.showToast({ title: '已复制', icon: 'success' });
  },
});
