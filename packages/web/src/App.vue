<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import api from '@/api';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 搜索
const searchKeyword = ref('');
const searchFocus = ref(false);
const suggestions = ref<{ id: number; title: string }[]>([]);
const hotTags = ref<string[]>([]);
let debounce: ReturnType<typeof setTimeout>;

async function loadHotTags() {
  try { hotTags.value = await api.get('/tags/hot', { limit: 8 }); } catch { hotTags.value = []; }
}

function onSearchFocus() {
  searchFocus.value = true;
  if (!hotTags.value.length) loadHotTags();
}

function onSearchBlur() {
  setTimeout(() => { searchFocus.value = false; }, 200);
}

watch(searchKeyword, (val) => {
  clearTimeout(debounce);
  if (!val.trim()) { suggestions.value = []; return; }
  debounce = setTimeout(async () => {
    try { suggestions.value = await api.get('/search/suggestions', { keyword: val, limit: 6 }); } catch { suggestions.value = []; }
  }, 200);
});

function doSearch(kw?: string) {
  const q = kw || searchKeyword.value.trim();
  if (!q) return;
  searchFocus.value = false;
  searchKeyword.value = '';
  router.push({ path: '/search', query: { keyword: q } });
}

function onTagClick(tag: string) {
  searchKeyword.value = tag;
  doSearch(tag);
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="container">
        <!-- 第一行：logo + 用户区 -->
        <div class="flex items-center justify-between h-12 md:h-16">
          <div class="flex items-center gap-4 md:gap-8 min-w-0">
            <router-link to="/" class="text-base md:text-xl font-bold text-primary-600 whitespace-nowrap">
              🚀 <span class="hidden sm:inline">AI Prompt Hub</span><span class="sm:hidden">APH</span>
            </router-link>
            <nav class="hidden md:flex items-center gap-6">
              <router-link to="/prompts" class="text-gray-600 hover:text-primary-600 transition text-sm">提示词广场</router-link>
              <router-link to="/skills" class="text-gray-600 hover:text-primary-600 transition text-sm">🎯 技巧</router-link>
              <router-link to="/tools/generator" class="text-gray-600 hover:text-primary-600 transition text-sm">生成器</router-link>
              <router-link to="/tools/optimizer" class="text-gray-600 hover:text-primary-600 transition text-sm">优化器</router-link>
              <router-link to="/tutorials" class="text-gray-600 hover:text-primary-600 transition text-sm">📖 教程</router-link>
            </nav>
          </div>
          <div class="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <template v-if="userStore.isLoggedIn">
              <el-dropdown trigger="click">
                <span class="text-gray-700 cursor-pointer text-sm font-medium whitespace-nowrap">
                  {{ (userStore.user?.nickname || '用户').slice(0, 6) }} ▾
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="router.push('/user')">个人中心</el-dropdown-item>
                    <el-dropdown-item @click="router.push('/user/favorites')">我的收藏</el-dropdown-item>
                    <el-dropdown-item @click="router.push('/user/submit')">提交提示词</el-dropdown-item>
                    <el-dropdown-item @click="router.push('/article/new')">📝 发布文章</el-dropdown-item>
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
            <!-- 桌面端搜索 -->
            <div class="relative hidden md:block">
              <div class="flex items-center bg-gray-100 rounded-full px-3 py-1.5 hover:bg-gray-200 transition cursor-pointer" @click="onSearchFocus">
                <span class="text-gray-400 mr-1.5 text-sm">🔍</span>
                <input
                  v-model="searchKeyword"
                  type="text"
                  placeholder="搜索提示词..."
                  class="bg-transparent border-none outline-none text-sm w-40 lg:w-48 text-gray-700 placeholder-gray-400"
                  @focus="onSearchFocus"
                  @blur="onSearchBlur"
                  @keyup.enter="doSearch()"
                />
              </div>
              <!-- 搜索下拉 -->
              <div v-if="searchFocus" class="absolute top-full mt-2 right-0 w-72 bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
                <div v-if="suggestions.length">
                  <div class="px-4 py-2 text-xs text-gray-400 font-medium">搜索建议</div>
                  <div
                    v-for="s in suggestions" :key="s.id"
                    class="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm flex items-center gap-2"
                    @mousedown.prevent="doSearch(s.title)"
                  >
                    <span class="text-gray-400">🔍</span>
                    <span>{{ s.title }}</span>
                  </div>
                </div>
                <div v-if="!searchKeyword && hotTags.length">
                  <div class="px-4 py-2 text-xs text-gray-400 font-medium">🔥 热门搜索</div>
                  <div class="flex flex-wrap gap-2 px-4 pb-3">
                    <span
                      v-for="t in hotTags" :key="t"
                      class="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 cursor-pointer hover:bg-primary-50 hover:text-primary-600 transition"
                      @mousedown.prevent="onTagClick(t)"
                    >{{ t }}</span>
                  </div>
                </div>
                <div v-if="searchKeyword && !suggestions.length" class="px-4 py-6 text-center text-sm text-gray-400">
                  暂无匹配结果，按回车搜索 "{{ searchKeyword }}"
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 第二行：移动端搜索 -->
        <div class="md:hidden pb-2.5">
          <div class="flex items-center bg-gray-100 rounded-full px-3 py-1.5" @click="onSearchFocus">
            <span class="text-gray-400 mr-1.5 text-sm">🔍</span>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索提示词..."
              class="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
              @focus="onSearchFocus"
              @blur="onSearchBlur"
              @keyup.enter="doSearch()"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- 搜索浮层（聚焦时全局显示） -->
    <div v-if="searchFocus" class="fixed inset-0 bg-black/30 z-40 md:hidden" @click="searchFocus = false"></div>
    <div v-if="searchFocus" class="md:hidden fixed top-[96px] inset-x-4 bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
      <div v-if="suggestions.length">
        <div class="px-4 py-2 text-xs text-gray-400 font-medium">搜索建议</div>
        <div
          v-for="s in suggestions" :key="s.id"
          class="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm flex items-center gap-2"
          @mousedown.prevent="doSearch(s.title)"
        >
          <span class="text-gray-400">🔍</span>
          <span>{{ s.title }}</span>
        </div>
      </div>
      <div v-if="!searchKeyword && hotTags.length">
        <div class="px-4 py-2 text-xs text-gray-400 font-medium">🔥 热门搜索</div>
        <div class="flex flex-wrap gap-2 px-4 pb-3">
          <span
            v-for="t in hotTags" :key="t"
            class="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 cursor-pointer hover:bg-primary-50 hover:text-primary-600 transition"
            @mousedown.prevent="onTagClick(t)"
          >{{ t }}</span>
        </div>
      </div>
      <div v-if="searchKeyword && !suggestions.length" class="px-4 py-6 text-center text-sm text-gray-400">
        暂无匹配结果，按回车搜索 "{{ searchKeyword }}"
      </div>
    </div>

    <!-- 页面内容 -->
    <main class="container py-4 md:py-6 flex-1 pb-20 md:pb-6">
      <router-view />
    </main>

    <!-- 移动端底部导航 -->
    <nav class="md:hidden fixed bottom-0 inset-x-0 bg-white border-t flex z-50">
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
