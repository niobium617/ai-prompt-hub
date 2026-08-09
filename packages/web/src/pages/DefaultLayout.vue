<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="container flex items-center justify-between h-16">
        <div class="flex items-center gap-8">
          <router-link to="/" class="text-xl font-bold text-primary-600">
            🚀 AI Prompt Hub
          </router-link>
          <nav class="hidden md:flex items-center gap-6">
            <router-link to="/prompts" class="text-gray-600 hover:text-primary-600 transition">
              提示词广场
            </router-link>
            <router-link to="/tools/generator" class="text-gray-600 hover:text-primary-600 transition">
              Prompt生成器
            </router-link>
            <router-link to="/tools/optimizer" class="text-gray-600 hover:text-primary-600 transition">
              Prompt优化器
            </router-link>
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <router-link to="/search" class="text-gray-500 hover:text-primary-600">
            <span>🔍 搜索</span>
          </router-link>
          <template v-if="userStore.isLoggedIn">
            <el-dropdown>
              <span class="text-gray-600 cursor-pointer">
                {{ userStore.user?.nickname || '用户' }}
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="router.push('/user')">个人中心</el-dropdown-item>
                  <el-dropdown-item @click="router.push('/user/favorites')">我的收藏</el-dropdown-item>
                  <el-dropdown-item @click="router.push('/user/submit')">提交提示词</el-dropdown-item>
                  <el-dropdown-item v-if="userStore.isAdmin" @click="router.push('/admin')">管理后台</el-dropdown-item>
                  <el-dropdown-item divided @click="userStore.logout()">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/login" class="text-gray-600 hover:text-primary-600">登录</router-link>
            <router-link to="/register">
              <el-button type="primary" size="small">注册</el-button>
            </router-link>
          </template>
        </div>
      </div>
    </header>

    <main class="container py-6">
      <slot />
      <router-view />
    </main>

    <footer class="bg-white border-t mt-12 py-8">
      <div class="container text-center text-gray-400 text-sm">
        <p>AI Prompt Hub © 2024 | 提示词社区分享平台</p>
        <p class="mt-1">Powered by Vue 3 + NestJS</p>
      </div>
    </footer>
  </div>
</template>
