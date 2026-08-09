<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api';
import PromptCard from '@/components/PromptCard.vue';

const favorites = ref<any[]>([]);

onMounted(async () => {
  const res = await api.get('/user/favorites');
  favorites.value = res.data.items;
});
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-xl p-6">
      <h1 class="text-xl font-bold mb-6">❤️ 我的收藏</h1>
      <div v-if="favorites.length" class="space-y-3">
        <PromptCard v-for="f in favorites" :key="f.id" :prompt="f" />
      </div>
      <div v-else class="text-center py-16 text-gray-400">
        <div class="text-5xl mb-4">📭</div>
        <p>还没有收藏任何提示词</p>
      </div>
    </div>
  </div>
</template>
