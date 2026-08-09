import { api } from '../../utils/request';

Page({
  data: { tags: [] as any[], hotPrompts: [] as any[] },
  onLoad() {
    Promise.all([
      api.get('/tags/hot'),
      api.get('/prompts/hot', { limit: 10 }),
    ]).then(([tags, prompts]) => this.setData({ tags, hotPrompts: prompts }));
  },
});
