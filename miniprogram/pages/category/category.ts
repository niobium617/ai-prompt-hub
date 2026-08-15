const app = getApp<IAppOption>();

Page({
  data: {
    categories: [] as any[],
    selectedId: 0,
    prompts: [] as any[],
    loading: false,
    error: '',
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: false,
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
      this.fetchPrompts(true);
    } catch (e: any) {
      console.error('分类加载失败:', e);
      this.setData({ error: '加载失败: ' + (e.errMsg || '网络错误') });
    }
  },

  onSelectCat(e: any) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedId: id, page: 1 });
    this.fetchPrompts(true);
  },

  /**
   * 加载提示词列表
   * reset=true 时重置分页，否则追加加载
   */
  async fetchPrompts(reset = false) {
    const page = reset ? 1 : this.data.page;
    this.setData({ loading: true });
    try {
      let res: any;
      if (this.data.selectedId > 0) {
        res = await this.request(`/categories/${this.data.selectedId}/prompts?page=${page}&pageSize=${this.data.pageSize}`, 'GET');
      } else {
        res = await this.request(`/prompts?page=${page}&pageSize=${this.data.pageSize}`, 'GET');
      }
      const items = res ? (res.items || []) : [];
      const total = res ? (res.total || 0) : 0;
      const prompts = reset ? items : this.data.prompts.concat(items);
      this.setData({
        prompts,
        loading: false,
        page,
        total,
        hasMore: prompts.length < total,
      });
    } catch {
      this.setData({ loading: false });
    }
  },

  /** 上拉加载更多 */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.fetchPrompts(false);
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1 });
    this.fetchPrompts(true).then(() => wx.stopPullDownRefresh());
  },

  onTapPrompt(e: any) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  // 直接 wx.request 封装，避免模块导入问题
  request(url: string, method: string): Promise<any> {
    const BASE = 'http://your-server-ip/api/v1';
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
