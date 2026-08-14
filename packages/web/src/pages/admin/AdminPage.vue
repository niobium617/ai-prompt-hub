<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';

const pendingPrompts = ref<any[]>([]);
const stats = ref<any>({});
const activeTab = ref('pending');

onMounted(async () => {
  await fetchData();
});

async function fetchData() {
  const [pRes, sRes] = await Promise.all([
    api.get('/admin/prompts/pending'),
    api.get('/admin/stats'),
  ]);
  pendingPrompts.value = pRes.items;
  stats.value = sRes;
}

async function approve(id: number) {
  try {
    await ElMessageBox.confirm('确认通过该提示词？', '审核通过', { type: 'success' });
    await api.post(`/admin/prompts/${id}/approve`);
    ElMessage.success('已通过');
    fetchData();
  } catch { /* cancelled */ }
}

async function reject(id: number) {
  try {
    await ElMessageBox.confirm('确认驳回该提示词？', '审核驳回', { type: 'warning' });
    await api.post(`/admin/prompts/${id}/reject`);
    ElMessage.success('已驳回');
    fetchData();
  } catch { /* cancelled */ }
}

async function removePrompt(id: number, title: string) {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      `删除《${title}》后不可恢复，将通知作者。请填写删除原因：`,
      '删除提示词',
      {
        type: 'warning',
        confirmButtonText: '删除并通知',
        confirmButtonClass: 'el-button--danger',
        inputPlaceholder: '如：内容违规 / 广告 / 重复内容',
        inputValidator: (v: string) => !!v.trim() || '请填写删除原因',
      },
    );
    await api.delete(`/admin/prompts/${id}`, { data: { reason } });
    ElMessage.success('已删除并通知作者');
    fetchData();
  } catch { /* cancelled */ }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 text-center">
        <div class="text-3xl font-bold text-primary-600">{{ stats.promptCount }}</div>
        <div class="text-sm text-gray-500 mt-1">提示词总数</div>
      </div>
      <div class="bg-white rounded-xl p-4 text-center">
        <div class="text-3xl font-bold text-green-600">{{ stats.userCount }}</div>
        <div class="text-sm text-gray-500 mt-1">用户总数</div>
      </div>
      <div class="bg-white rounded-xl p-4 text-center">
        <div class="text-3xl font-bold text-orange-600">{{ stats.articleCount }}</div>
        <div class="text-sm text-gray-500 mt-1">文章总数</div>
      </div>
    </div>

    <div class="bg-white rounded-xl p-6">
      <h2 class="font-semibold mb-4">📋 待审核提示词 ({{ pendingPrompts.length }})</h2>
      <div v-if="pendingPrompts.length === 0" class="text-center py-12 text-gray-400">
        <div class="text-4xl mb-3">✅</div>
        <p>暂无待审核内容</p>
      </div>
      <div v-else class="space-y-4">
        <div v-for="p in pendingPrompts" :key="p.id" class="border rounded-xl p-4 hover:bg-gray-50">
          <h3 class="font-semibold mb-2">{{ p.title }}</h3>
          <p class="text-sm text-gray-500 mb-2">{{ p.description }}</p>
          <div class="flex items-center justify-between">
            <div class="text-xs text-gray-400">
              {{ p.category?.name }} · 作者：{{ p.author?.nickname }} · {{ new Date(p.createdAt).toLocaleDateString() }}
            </div>
            <div class="flex gap-2">
              <el-button size="small" type="success" @click="approve(p.id)">通过</el-button>
              <el-button size="small" type="danger" @click="reject(p.id)">驳回</el-button>
              <el-button size="small" type="danger" plain @click="removePrompt(p.id, p.title)">🗑 删除</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
