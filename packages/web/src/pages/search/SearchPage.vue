<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';
import PromptCard from '@/components/PromptCard.vue';

const route = useRoute();
const router = useRouter();
const keyword = ref((route.query.keyword as string) || '');
const prompts = ref<any[]>([]);
const suggestions = ref<{ id: number; title: string }[]>([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);

onMounted(() => { if (keyword.value) doSearch(); });

async function doSearch() {
  if (!keyword.value.trim()) return;
  loading.value = true;
  try {
    const res = await api.get('/search', { params: { keyword: keyword.value, page: page.value } });
    prompts.value = res.items;
    total.value = res.total;
  } finally { loading.value = false; }
}

watch(page, () => doSearch());

let debounceTimer: ReturnType<typeof setTimeout>;
watch(keyword, (val) => {
  clearTimeout(debounceTimer);
  if (!val) { suggestions.value = []; return; }
  debounceTimer = setTimeout(async () => {
    const res = await api.get('/search/suggestions', { params: { keyword: val } });
    suggestions.value = res;
  }, 300);
});
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-6">
      <el-input
        v-model="keyword"
        size="large"
        placeholder="搜索提示词..."
        @keyup.enter="doSearch"
        clearable
      >
        <template #append>
          <el-button @click="doSearch">搜索</el-button>
        </template>
      </el-input>
      <div v-if="suggestions.length" class="bg-white rounded-xl mt-1 p-3 shadow-lg">
        <div
          v-for="s in suggestions" :key="s.id"
          @click="keyword = s.title; doSearch(); suggestions = []"
          class="py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
        >
          {{ s.title }}
        </div>
      </div>
    </div>

    <div v-if="keyword && total > 0" class="mb-4 text-sm text-gray-500">
      搜索 "{{ keyword }}" 共找到 {{ total }} 条结果
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="bg-white rounded-xl p-5 animate-pulse">
        <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div class="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    </div>

    <div v-else-if="keyword && prompts.length === 0 && !loading" class="text-center py-20 text-gray-400">
      <div class="text-5xl mb-4">🔍</div>
      <p>未找到相关提示词</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="p in prompts" :key="p.id" @click="router.push(`/prompts/${p.id}`)"
        class="bg-white rounded-xl p-5 cursor-pointer hover:shadow-md transition border hover:border-primary-200">
        <h3 class="font-semibold mb-2 text-primary-700">{{ p.title }}</h3>
        <p class="text-sm text-gray-500 line-clamp-2">{{ p.description }}</p>
        <div class="flex gap-2 mt-3">
          <el-tag size="small">{{ p.category?.name }}</el-tag>
          <span class="text-xs text-gray-400">👁 {{ p.viewCount }} · ⭐ {{ p.ratingAvg }} · {{ p.createdAt?.slice(0, 10) }}</span>
        </div>
      </div>
    </div>

    <div v-if="total > 12" class="flex justify-center mt-8">
      <el-pagination v-model:current-page="page" :page-size="12" :total="total" layout="prev, pager, next" background />
    </div>
  </div>
</template>
