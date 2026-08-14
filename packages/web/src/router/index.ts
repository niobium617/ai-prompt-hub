import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/home/HomePage.vue'),
      meta: { title: 'AI Prompt Hub - 首页' },
    },
    {
      path: '/prompts',
      name: 'prompts',
      component: () => import('../pages/prompts/ListPage.vue'),
      meta: { title: '提示词广场' },
    },
    {
      path: '/prompts/:id',
      name: 'prompt-detail',
      component: () => import('../pages/prompts/DetailPage.vue'),
      meta: { title: '提示词详情' },
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../pages/search/SearchPage.vue'),
      meta: { title: '搜索' },
    },
    {
      path: '/articles/:id',
      name: 'article',
      component: () => import('../pages/article/ArticlePage.vue'),
      meta: { title: '文章详情' },
    },
    {
      path: '/tools/generator',
      name: 'generator',
      component: () => import('../pages/tools/GeneratorPage.vue'),
      meta: { title: 'Prompt生成器' },
    },
    {
      path: '/tools/optimizer',
      name: 'optimizer',
      component: () => import('../pages/tools/OptimizerPage.vue'),
      meta: { title: 'Prompt优化器' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/user/LoginPage.vue'),
      meta: { title: '登录', guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/user/RegisterPage.vue'),
      meta: { title: '注册', guest: true },
    },
    {
      path: '/user',
      name: 'profile',
      component: () => import('../pages/user/ProfilePage.vue'),
      meta: { title: '个人中心', requiresAuth: true },
    },
    {
      path: '/article/new',
      name: 'article-new',
      component: () => import('../pages/article/EditPage.vue'),
      meta: { title: '发布文章', requiresAuth: true },
    },
    {
      path: '/user/favorites',
      name: 'favorites',
      component: () => import('../pages/user/FavoritesPage.vue'),
      meta: { title: '我的收藏', requiresAuth: true },
    },
    {
      path: '/user/notifications',
      name: 'notifications',
      component: () => import('../pages/user/NotificationsPage.vue'),
      meta: { title: '通知中心', requiresAuth: true },
    },
    {
      path: '/user/submit',
      name: 'submit',
      component: () => import('../pages/user/SubmitPage.vue'),
      meta: { title: '提交提示词', requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../pages/admin/AdminPage.vue'),
      meta: { title: '管理后台', requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/skills',
      name: 'skills',
      component: () => import('../pages/skills/SkillsPage.vue'),
      meta: { title: 'Prompt 技巧大全' },
    },
    {
      path: '/tutorials',
      name: 'tutorials',
      component: () => import('../pages/tutorials/TutorialsPage.vue'),
      meta: { title: 'AI 工具使用教程' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  document.title = (to.meta.title as string) || 'AI Prompt Hub';

  const userStore = useUserStore();
  // 等 store 初始化完成
  if (!userStore.inited) {
    await userStore.init();
  }

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return next('/login');
  }
  if (to.meta.guest && userStore.isLoggedIn) {
    return next('/');
  }
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return next('/');
  }
  next();
});

export default router;
