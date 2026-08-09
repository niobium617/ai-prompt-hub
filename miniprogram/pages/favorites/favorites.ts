import { api } from '../../utils/request';

Page({
  data: { favorites: [] as any[] },
  onShow() {
    api.get('/user/favorites').then(res => this.setData({ favorites: (res as any).items }));
  },
});
