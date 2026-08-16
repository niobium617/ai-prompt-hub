<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import api from '@/api';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 未读通知数
const unreadCount = ref(0);

async function fetchUnread() {
  if (!userStore.isLoggedIn) { unreadCount.value = 0; return; }
  try {
    const res = await api.get('/user/notifications', { pageSize: 1 });
    unreadCount.value = res.unreadCount || 0;
  } catch { unreadCount.value = 0; }
}

onMounted(fetchUnread);
watch(() => userStore.isLoggedIn, fetchUnread);
watch(() => route.fullPath, fetchUnread);
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 顶部导航 -->
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="container">
        <div class="flex items-center justify-between h-14 md:h-16">
          <div class="flex items-center gap-3 md:gap-8 min-w-0">
            <router-link to="/" class="text-lg md:text-xl font-bold text-primary-600 whitespace-nowrap">
              🚀 AI Prompt Hub
            </router-link>
            <!-- 开发模式标识 -->
            <span v-if="userStore.devMode" class="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-medium whitespace-nowrap">
              🔧 开发模式
            </span>
            <nav class="hidden md:flex items-center gap-6">
              <router-link to="/" class="text-gray-600 hover:text-primary-600 transition text-sm"
                :class="route.path === '/' ? 'text-primary-600 font-semibold' : ''">首页</router-link>
              <router-link to="/prompts" class="text-gray-600 hover:text-primary-600 transition text-sm">提示词广场</router-link>
              <router-link to="/skills" class="text-gray-600 hover:text-primary-600 transition text-sm">🎯 技巧</router-link>
              <router-link to="/tools/generator" class="text-gray-600 hover:text-primary-600 transition text-sm">生成器</router-link>
              <router-link to="/tools/optimizer" class="text-gray-600 hover:text-primary-600 transition text-sm">优化器</router-link>
              <router-link to="/tutorials" class="text-gray-600 hover:text-primary-600 transition text-sm">📖 教程</router-link>
            </nav>
          </div>
          <div class="flex items-center gap-3 md:gap-4 flex-shrink-0">
            <template v-if="userStore.isLoggedIn">
              <!-- 通知铃铛 -->
              <router-link to="/user/notifications" class="relative" title="通知">
                <span class="text-lg">🔔</span>
                <span
                  v-if="unreadCount > 0"
                  class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center font-medium"
                >{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
              </router-link>
              <el-dropdown trigger="click">
                <span class="text-gray-700 cursor-pointer text-sm font-medium whitespace-nowrap">
                  {{ (userStore.user?.nickname || '用户').slice(0, 6) }} ▾
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="router.push('/user')">个人中心</el-dropdown-item>
                    <el-dropdown-item @click="router.push('/user/favorites')">我的收藏</el-dropdown-item>
                    <template v-if="!userStore.devMode || userStore.isDevTester">
                      <el-dropdown-item @click="router.push('/user/submit')">提交提示词</el-dropdown-item>
                      <el-dropdown-item @click="router.push('/article/new')">📝 发布文章</el-dropdown-item>
                      <el-dropdown-item @click="router.push('/user/drafts')">🔒 我的草稿</el-dropdown-item>
                    </template>
                    <el-dropdown-item v-if="userStore.isAdmin" @click="router.push('/admin')">管理后台</el-dropdown-item>
                    <el-dropdown-item divided @click="userStore.logout(); router.push('/')">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template v-else>
              <router-link to="/login" class="text-sm text-gray-600 hover:text-primary-600 whitespace-nowrap">登录</router-link>
              <router-link to="/register">
                <el-button type="primary" size="small">注册</el-button>
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- 页面内容 -->
    <main class="container page-main py-4 md:py-6 flex-1">
      <router-view />
    </main>

    <!-- 移动端底部导航 -->
    <nav class="bottom-tabbar md:hidden fixed bottom-0 inset-x-0 bg-white border-t flex z-50">
      <router-link to="/" class="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-xs"
        :class="route.path === '/' ? 'text-primary-600' : 'text-gray-500'">
        <span class="text-lg">🏠</span>首页
      </router-link>
      <router-link to="/prompts" class="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-xs"
        :class="route.path.startsWith('/prompts') ? 'text-primary-600' : 'text-gray-500'">
        <span class="text-lg">📁</span>广场
      </router-link>
      <router-link to="/tutorials" class="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-xs"
        :class="route.path.startsWith('/tutorials') ? 'text-primary-600' : 'text-gray-500'">
        <span class="text-lg">📖</span>教程
      </router-link>
      <router-link to="/tools/generator" class="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-xs"
        :class="route.path.startsWith('/tools') ? 'text-primary-600' : 'text-gray-500'">
        <span class="text-lg">🛠️</span>工具
      </router-link>
      <router-link to="/user" class="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-xs"
        :class="route.path.startsWith('/user') ? 'text-primary-600' : 'text-gray-500'">
        <span class="text-lg">👤</span>我的
      </router-link>
    </nav>

    <!-- 桌面底部 -->
    <footer class="hidden md:block bg-white border-t py-8 mt-auto">
      <div class="container">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 text-sm">
          <div>
            <h4 class="font-semibold text-gray-700 mb-3">探索</h4>
            <div class="space-y-2">
              <router-link to="/prompts" class="block text-gray-500 hover:text-primary-600">提示词广场</router-link>
              <router-link to="/skills" class="block text-gray-500 hover:text-primary-600">Prompt技巧</router-link>
              <router-link to="/tutorials" class="block text-gray-500 hover:text-primary-600">AI工具教程</router-link>
            </div>
          </div>
          <div>
            <h4 class="font-semibold text-gray-700 mb-3">工具</h4>
            <div class="space-y-2">
              <router-link to="/tools/generator" class="block text-gray-500 hover:text-primary-600">Prompt生成器</router-link>
              <router-link to="/tools/optimizer" class="block text-gray-500 hover:text-primary-600">Prompt优化器</router-link>
            </div>
          </div>
          <div>
            <h4 class="font-semibold text-gray-700 mb-3">GitHub</h4>
            <div class="space-y-2">
              <a href="https://github.com/niobium617/ai-prompt-hub" target="_blank" class="block text-gray-500 hover:text-primary-600">📂 本项目源码</a>
              <a href="https://github.com/niobium617/prompt-reverse-engineer-skill" target="_blank" class="block text-gray-500 hover:text-primary-600">🔬 官方逆向工程 Skill</a>
              <a href="https://github.com/f/awesome-chatgpt-prompts" target="_blank" class="block text-gray-500 hover:text-primary-600">⭐ Awesome Prompts</a>
              <a href="https://github.com/dair-ai/Prompt-Engineering-Guide" target="_blank" class="block text-gray-500 hover:text-primary-600">📖 Prompt工程指南</a>
            </div>
          </div>
          <div>
            <h4 class="font-semibold text-gray-700 mb-3">关于</h4>
            <div class="space-y-2">
              <span class="block text-gray-500">Powered by Vue 3 + NestJS</span>
              <span class="block text-gray-500">SQLite + Prisma</span>
              <span class="block text-gray-400 text-xs mt-2">© 2024 AI Prompt Hub</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
