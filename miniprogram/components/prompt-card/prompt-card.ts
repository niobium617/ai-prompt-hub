Component({
  properties: {
    prompt: {
      type: Object,
      value: {},
    },
  },
  methods: {
    onTap() {
      const id = (this.properties.prompt as any).id;
      wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
    },
  },
});
