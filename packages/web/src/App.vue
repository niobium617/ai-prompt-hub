<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="container flex items-center justify-between h-16">
        <div class="flex items-center gap-8">
          <router-link to="/" class="text-xl font-bold text-primary-600">
            🚀 AI Prompt Hub
          </router-link>
          <nav class="hidden md:flex items-center gap-6">
            <router-link to="/prompts" class="text-gray-600 hover:text-primary-600 transition text-sm">
              提示词广场
            </router-link>
            <router-link to="/skills" class="text-gray-600 hover:text-primary-600 transition text-sm">
              🎯 技巧
            </router-link>
            <router-link to="/tools/generator" class="text-gray-600 hover:text-primary-600 transition text-sm">
              生成器
            </router-link>
            <router-link to="/tools/optimizer" class="text-gray-600 hover:text-primary-600 transition text-sm">
              优化器
            </router-link>
            <router-link to="/resources" class="text-gray-600 hover:text-primary-600 transition text-sm">
              📦 资源
            </router-link>
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <router-link to="/search" class="text-gray-500 hover:text-primary-600 text-sm">
            🔍 搜索
          </router-link>
          <template v-if="userStore.isLoggedIn">
            <el-dropdown trigger="click">
              <span class="text-gray-700 cursor-pointer text-sm font-medium">
                {{ userStore.user?.nickname || '用户' }} ▾
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="router.push('/user')">个人中心</el-dropdown-item>
                  <el-dropdown-item @click="router.push('/user/favorites')">我的收藏</el-dropdown-item>
                  <el-dropdown-item @click="router.push('/user/submit')">提交提示词</el-dropdown-item>
                  <el-dropdown-item v-if="userStore.isAdmin" @click="router.push('/admin')">管理后台</el-dropdown-item>
                  <el-dropdown-item divided @click="userStore.logout(); router.push('/')">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/login" class="text-sm text-gray-600 hover:text-primary-600">登录</router-link>
            <router-link to="/register">
              <el-button type="primary" size="small">注册</el-button>
            </router-link>
          </template>
        </div>
      </div>
    </header>

    <!-- 页面内容 -->
    <main class="container py-6 flex-1">
      <router-view />
    </main>

    <!-- 底部 -->
    <footer class="bg-white border-t py-8 mt-auto">
      <div class="container">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 text-sm">
          <div>
            <h4 class="font-semibold text-gray-700 mb-3">探索</h4>
            <div class="space-y-2">
              <router-link to="/prompts" class="block text-gray-500 hover:text-primary-600">提示词广场</router-link>
              <router-link to="/skills" class="block text-gray-500 hover:text-primary-600">Prompt技巧</router-link>
              <router-link to="/resources" class="block text-gray-500 hover:text-primary-600">AI资源</router-link>
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
