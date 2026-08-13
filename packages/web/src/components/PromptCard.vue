<script setup lang="ts">
import { useRouter } from 'vue-router';

const props = defineProps<{ prompt: any }>();
const router = useRouter();

function goDetail() {
  router.push(`/prompts/${props.prompt.id}`);
}
</script>

<template>
  <div
    @click="goDetail"
    class="bg-white rounded-xl p-5 cursor-pointer hover:shadow-lg transition border border-gray-100 hover:border-primary-200"
  >
    <div class="flex items-start justify-between mb-3">
      <h3 class="font-semibold text-gray-800 line-clamp-2 flex-1">{{ prompt.title }}</h3>
      <el-tag v-if="prompt.difficulty === 1" size="small" type="success">入门</el-tag>
      <el-tag v-else-if="prompt.difficulty === 2" size="small" type="warning">进阶</el-tag>
      <el-tag v-else size="small" type="danger">高级</el-tag>
    </div>
    <p class="text-sm text-gray-500 line-clamp-2 mb-4">{{ prompt.description }}</p>
    <div class="flex items-center justify-between text-xs text-gray-400">
      <span class="flex items-center gap-1">📁 {{ prompt.category?.name || '未分类' }}</span>
      <div class="flex items-center gap-3">
        <span>👁 {{ prompt.viewCount }}</span>
        <span>⭐ {{ prompt.ratingAvg }}</span>
        <span>❤ {{ prompt.favoriteCount }}</span>
      </div>
    </div>
  </div>
</template>
