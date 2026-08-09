<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api';
import { marked } from 'marked';

const route = useRoute();
const article = ref<any>(null);

onMounted(async () => {
  const res = await api.get(`/articles/${route.params.id}`);
  article.value = res;
});
</script>

<template>
  <div v-if="article" class="max-w-3xl mx-auto">
    <div class="bg-white rounded-xl p-6">
      <h1 class="text-2xl font-bold mb-3">{{ article.title }}</h1>
      <div class="flex items-center gap-3 text-sm text-gray-400 mb-6">
        <span>{{ article.author?.nickname }}</span>
        <span>{{ new Date(article.createdAt).toLocaleDateString() }}</span>
        <span>👁 {{ article.viewCount }}</span>
      </div>
      <div class="prose max-w-none" v-html="marked(article.content)"></div>
    </div>
  </div>
</template>
