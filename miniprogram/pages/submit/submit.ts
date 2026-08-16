import { api } from '../../utils/request';

const BASE_URL = 'https://your-domain.com/api/v1'; // TODO: 替换为你的服务器地址

Page({
  data: {
    categories: [] as any[],
    catIndex: 0,
    title: '',
    description: '',
    content: '',
    difficulty: 1,
    exampleImages: [] as string[],
    uploading: false,
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
  onTitle(e: any) { this.setData({ title: e.detail.value }); },
  onDesc(e: any) { this.setData({ description: e.detail.value }); },
  onContent(e: any) { this.setData({ content: e.detail.value }); },

  /** 选择并上传效果示例图 */
  onChooseImage() {
    if (!wx.getStorageSync('accessToken')) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: 3,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: (res) => {
        res.tempFiles.forEach((file) => this.uploadImage(file.tempFilePath));
      },
    });
  },

  uploadImage(filePath: string) {
    this.setData({ uploading: true });
    const token = wx.getStorageSync('accessToken');
    wx.uploadFile({
      url: BASE_URL + '/upload/image',
      filePath,
      name: 'file',
      header: { Authorization: `Bearer ${token}` },
      success: (res: any) => {
        try {
          const data = JSON.parse(res.data);
          if (data.url) {
            this.setData({ exampleImages: [...this.data.exampleImages, data.url] });
            wx.showToast({ title: '图片已添加', icon: 'success' });
          } else {
            wx.showToast({ title: data.message || '上传失败', icon: 'none' });
          }
        } catch {
          wx.showToast({ title: '上传失败', icon: 'none' });
        }
      },
      fail: () => wx.showToast({ title: '网络异常', icon: 'none' }),
      complete: () => this.setData({ uploading: false }),
    });
  },

  removeImage(e: any) {
    const i = e.currentTarget.dataset.index;
    const imgs = [...this.data.exampleImages];
    imgs.splice(i, 1);
    this.setData({ exampleImages: imgs });
  },

  previewImage(e: any) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({ current: url, urls: this.data.exampleImages });
  },

  async onSubmit() {
    const { title, description, content, categories, catIndex, difficulty, exampleImages } = this.data;
    if (!title.trim() || !content.trim()) { wx.showToast({ title: '标题和内容必填', icon: 'none' }); return; }
    this.setData({ submitting: true });
    try {
      await api.post('/prompts', {
        title, description, content,
        categoryId: categories[catIndex]?.id,
        difficulty,
        exampleImages,
      });
      wx.showToast({ title: '提交成功，等待审核', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch { }
    this.setData({ submitting: false });
  },
});
