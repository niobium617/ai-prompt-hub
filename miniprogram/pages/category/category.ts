const app = getApp<IAppOption>();

Page({
  data: {
    categories: [] as any[],
    selectedId: 0,
    prompts: [] as any[],
    loading: false,
    error: '',
  },

  onLoad() {
    this.loadCategories();
  },

  async loadCategories() {
    try {
      const cats: any = await this.request('/categories', 'GET');
      const catList = Array.isArray(cats) ? cats : [];
      console.log('分类数据:', catList.length, '条');
      this.setData({ categories: catList });
      this.fetchPrompts();
    } catch (e: any) {
      console.error('分类加载失败:', e);
      this.setData({ error: '加载失败: ' + (e.errMsg || '网络错误') });
    }
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
        res = await this.request(`/categories/${this.data.selectedId}/prompts`, 'GET');
      } else {
        res = await this.request('/prompts?pageSize=50', 'GET');
      }
      this.setData({ prompts: res ? (res.items || []) : [], loading: false });
    } catch {
      this.setData({ prompts: [], loading: false });
    }
  },

  onTapPrompt(e: any) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  // 直接 wx.request 封装，避免模块导入问题
  request(url: string, method: string): Promise<any> {
    const BASE = 'http://localhost:3000/api/v1';
    const token = wx.getStorageSync('accessToken') || '';
    return new Promise((resolve, reject) => {
      wx.request({
        url: BASE + url,
        method: method as any,
        header: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        success(r: any) {
          if (r.statusCode === 200 || r.statusCode === 201) resolve(r.data);
          else reject(r);
        },
        fail: reject,
      });
    });
  },
});
