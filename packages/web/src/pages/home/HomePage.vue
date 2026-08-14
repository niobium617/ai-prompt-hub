<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import PromptCard from '@/components/PromptCard.vue';

const router = useRouter();
const hotPrompts = ref<any[]>([]);
const featuredPrompts = ref<any[]>([]);
const categories = ref<any[]>([]);
const searchKeyword = ref('');

onMounted(async () => {
  const [hotRes, featRes, catRes] = await Promise.all([
    api.get('/prompts/hot', { limit: 6 }),
    api.get('/prompts/featured', { limit: 6 }),
    api.get('/categories'),
  ]);
  hotPrompts.value = hotRes;
  featuredPrompts.value = featRes;
  categories.value = catRes;
});

function onSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { keyword: searchKeyword.value } });
  }
}
</script>

<template>
  <!-- Banner -->
  <section class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-10 mb-8 text-white text-center">
    <h1 class="text-2xl md:text-4xl font-bold mb-4">发现高质量的 AI 提示词</h1>
    <p class="text-base md:text-lg opacity-90 mb-6">汇集最实用的 Prompt，让每个人都能用好 AI</p>
    <div class="max-w-xl mx-auto flex gap-2">
      <el-input
        v-model="searchKeyword"
        size="large"
        placeholder="搜索你需要的提示词..."
        @keyup.enter="onSearch"
        class="flex-1"
      />
      <el-button type="warning" size="large" @click="onSearch">搜索</el-button>
    </div>
  </section>

  <!-- 分类入口 -->
  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4">📂 分类浏览</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div
        v-for="cat in categories"
        :key="cat.id"
        @click="router.push({ path: '/prompts', query: { categoryId: cat.id } })"
        class="bg-white rounded-xl p-4 text-center cursor-pointer hover:shadow-md transition border hover:border-primary-300"
      >
        <div class="text-2xl mb-2">{{ cat.icon === 'edit' ? '✏️' : cat.icon === 'code' ? '💻' : cat.icon === 'palette' ? '🎨' : cat.icon === 'campaign' ? '📢' : cat.icon === 'insights' ? '📊' : '📚' }}</div>
        <div class="text-sm font-medium text-gray-700">{{ cat.name }}</div>
      </div>
    </div>
  </section>

  <!-- 精选推荐 -->
  <section class="mb-8">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">⭐ 精选推荐</h2>
      <router-link to="/prompts?sort=rating" class="text-primary-600 text-sm">查看更多 →</router-link>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <PromptCard v-for="p in featuredPrompts" :key="p.id" :prompt="p" />
    </div>
  </section>

  <!-- 热门提示词 -->
  <section>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">🔥 热门提示词</h2>
      <router-link to="/prompts?sort=hot" class="text-primary-600 text-sm">查看更多 →</router-link>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <PromptCard v-for="p in hotPrompts" :key="p.id" :prompt="p" />
    </div>
  </section>
</template>
