import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../pages/home/HomePage.vue'),
      meta: { title: 'AI Prompt Hub - 首页' },
    },
    {
      path: '/prompts',
      component: () => import('../pages/prompts/ListPage.vue'),
      meta: { title: '提示词广场' },
    },
    {
      path: '/prompts/:id',
      component: () => import('../pages/prompts/DetailPage.vue'),
      meta: { title: '提示词详情' },
    },
    {
      path: '/search',
      component: () => import('../pages/search/SearchPage.vue'),
      meta: { title: '搜索' },
    },
    {
      path: '/articles/:id',
      component: () => import('../pages/article/ArticlePage.vue'),
      meta: { title: '文章详情' },
    },
    {
      path: '/tools/generator',
      component: () => import('../pages/tools/GeneratorPage.vue'),
      meta: { title: 'Prompt生成器' },
    },
    {
      path: '/tools/optimizer',
      component: () => import('../pages/tools/OptimizerPage.vue'),
      meta: { title: 'Prompt优化器' },
    },
    {
      path: '/login',
      component: () => import('../pages/user/LoginPage.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/register',
      component: () => import('../pages/user/RegisterPage.vue'),
      meta: { title: '注册' },
    },
    {
      path: '/user',
      component: () => import('../pages/user/ProfilePage.vue'),
      meta: { title: '个人中心', requiresAuth: true },
    },
    {
      path: '/user/favorites',
      component: () => import('../pages/user/FavoritesPage.vue'),
      meta: { title: '我的收藏', requiresAuth: true },
    },
    {
      path: '/user/submit',
      component: () => import('../pages/user/SubmitPage.vue'),
      meta: { title: '提交提示词', requiresAuth: true },
    },
    {
      path: '/admin',
      component: () => import('../pages/admin/AdminPage.vue'),
      meta: { title: '管理后台', requiresAuth: true, requiresAdmin: true },
    },
  ],
});

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || 'AI Prompt Hub';
  const token = localStorage.getItem('accessToken');
  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }
  next();
});

export default router;
