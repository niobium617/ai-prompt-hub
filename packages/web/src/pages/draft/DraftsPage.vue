<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api, { extractError } from '@/api';
import { ElMessage } from 'element-plus';

const router = useRouter();
const drafts = ref<any[]>([]);
const total = ref(0);
const loading = ref(false);

async function fetchList() {
  loading.value = true;
  try {
    const res = await api.get('/drafts', { page: 1, pageSize: 50 });
    drafts.value = res.items;
    total.value = res.total;
  } catch (e: any) {
    ElMessage.error(extractError(e));
  }
  loading.value = false;
}

onMounted(fetchList);

function goEdit(d: any) {
  router.push(`/drafts/${d.id}`);
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="bg-white rounded-xl p-6">
      <h1 class="text-xl font-bold mb-6">🔒 我的草稿（共 {{ total }} 份）</h1>

      <div v-if="loading" class="text-center py-10 text-gray-400">加载中...</div>

      <div v-else-if="drafts.length === 0" class="text-center py-16 text-gray-400">
        <div class="text-5xl mb-4">📝</div>
        <p>暂无草稿</p>
        <p class="text-sm mt-2">在任意提示词详情页点击「基于此创建草稿」即可开始</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="d in drafts" :key="d.id"
          @click="goEdit(d)"
          class="border rounded-xl p-4 cursor-pointer hover:border-primary-300 hover:shadow-sm transition"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-800 truncate">{{ d.title }}</h3>
              <p class="text-sm text-gray-500 line-clamp-2 mt-1">{{ d.description }}</p>
            </div>
            <el-button size="small" type="primary" plain>✏️ 编辑</el-button>
          </div>
          <div class="text-xs text-gray-400 mt-2">
            🔒 私有 · 更新于 {{ d.updatedAt?.slice(0, 16).replace('T', ' ') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
