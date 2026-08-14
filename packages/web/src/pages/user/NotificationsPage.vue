<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api';
import { ElMessage } from 'element-plus';

const items = ref<any[]>([]);
const unread = ref(0);
const loading = ref(false);

async function fetchList() {
  loading.value = true;
  try {
    const res = await api.get('/user/notifications');
    items.value = res.items;
    unread.value = res.unreadCount;
  } finally {
    loading.value = false;
  }
}

async function markAll() {
  await api.post('/user/notifications/read');
  ElMessage.success('已全部标记为已读');
  fetchList();
}

onMounted(fetchList);
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-xl p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-xl font-bold">🔔 通知</h1>
        <el-button v-if="unread > 0" size="small" @click="markAll">全部已读</el-button>
      </div>

      <div v-if="loading" class="text-center py-10 text-gray-400">加载中...</div>

      <div v-else-if="items.length === 0" class="text-center py-16 text-gray-400">
        <div class="text-5xl mb-4">📭</div>
        <p>暂无通知</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="n in items" :key="n.id"
          class="flex gap-3 p-4 rounded-xl border"
          :class="n.isRead ? 'bg-white border-gray-100' : 'bg-primary-50/50 border-primary-100'"
        >
          <div class="text-xl flex-shrink-0">
            {{ n.type === 'delete' ? '🗑️' : n.type === 'system' ? '📢' : '💬' }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm flex items-center gap-2">
              {{ n.title }}
              <span v-if="!n.isRead" class="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0"></span>
            </div>
            <div class="text-sm text-gray-500 mt-1 leading-relaxed">{{ n.content }}</div>
            <div class="text-xs text-gray-400 mt-2">{{ n.createdAt?.slice(0, 16).replace('T', ' ') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
