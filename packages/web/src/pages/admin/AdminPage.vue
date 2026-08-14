<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';

const pendingPrompts = ref<any[]>([]);
const publishedPrompts = ref<any[]>([]);
const publishedArticles = ref<any[]>([]);
const stats = ref<any>({});
const activeTab = ref('pending');

onMounted(fetchData);

async function fetchData() {
  const [pRes, sRes] = await Promise.all([
    api.get('/admin/prompts/pending'),
    api.get('/admin/stats'),
  ]);
  pendingPrompts.value = pRes.items;
  stats.value = sRes;
}

async function fetchPublished() {
  const [promptsRes, articlesRes] = await Promise.all([
    api.get('/admin/prompts/published'),
    api.get('/admin/articles/published'),
  ]);
  publishedPrompts.value = promptsRes.items;
  publishedArticles.value = articlesRes.items;
}

function onTabChange(tab: string) {
  activeTab.value = tab;
  if (tab === 'published') fetchPublished();
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

/** 通用：删除并通知（提示词/文章） */
async function removeWithReason(url: string, title: string, typeName: string) {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      `删除《${title}》后不可恢复，将通知作者。请填写删除原因：`,
      `删除${typeName}`,
      {
        type: 'warning',
        confirmButtonText: '删除并通知',
        confirmButtonClass: 'el-button--danger',
        inputPlaceholder: '如：内容违规 / 广告 / 重复内容',
        inputValidator: (v: string) => !!v.trim() || '请填写删除原因',
      },
    );
    await api.delete(url, { reason });
    ElMessage.success('已删除并通知作者');
    fetchData();
    if (activeTab.value === 'published') fetchPublished();
  } catch { /* cancelled */ }
}

function removePrompt(id: number, title: string) {
  return removeWithReason(`/admin/prompts/${id}`, title, '提示词');
}

function removeArticle(id: number, title: string) {
  return removeWithReason(`/admin/articles/${id}`, title, '文章');
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

    <!-- 页签切换 -->
    <div class="flex gap-2 mb-4">
      <el-button :type="activeTab === 'pending' ? 'primary' : 'default'" size="small" @click="onTabChange('pending')">
        待审核 ({{ pendingPrompts.length }})
      </el-button>
      <el-button :type="activeTab === 'published' ? 'primary' : 'default'" size="small" @click="onTabChange('published')">
        已发布内容
      </el-button>
    </div>

    <!-- 待审核提示词 -->
    <div v-if="activeTab === 'pending'" class="bg-white rounded-xl p-6">
      <h2 class="font-semibold mb-4">📋 待审核提示词 ({{ pendingPrompts.length }})</h2>
      <div v-if="pendingPrompts.length === 0" class="text-center py-12 text-gray-400">
        <div class="text-4xl mb-3">✅</div>
        <p>暂无待审核内容</p>
      </div>
      <div v-else class="space-y-4">
        <div v-for="p in pendingPrompts" :key="p.id" class="border rounded-xl p-4 hover:bg-gray-50">
          <h3 class="font-semibold mb-2">{{ p.title }}</h3>
          <p class="text-sm text-gray-500 mb-2">{{ p.description }}</p>
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="text-xs text-gray-400">
              {{ p.category?.name }} · 作者：{{ p.author?.nickname }} (@{{ p.author?.username }}) · {{ new Date(p.createdAt).toLocaleDateString() }}
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

    <!-- 已发布内容 -->
    <div v-if="activeTab === 'published'" class="space-y-6">
      <!-- 已发布提示词 -->
      <div class="bg-white rounded-xl p-6">
        <h2 class="font-semibold mb-4">📌 已发布提示词 ({{ publishedPrompts.length }})</h2>
        <div v-if="publishedPrompts.length === 0" class="text-center py-10 text-gray-400">暂无已发布提示词</div>
        <div v-else class="space-y-4">
          <div v-for="p in publishedPrompts" :key="p.id" class="border rounded-xl p-4 hover:bg-gray-50">
            <h3 class="font-semibold mb-2">{{ p.title }}</h3>
            <p class="text-sm text-gray-500 mb-2">{{ p.description }}</p>
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="text-xs text-gray-400">
                {{ p.category?.name }} · 作者：{{ p.author?.nickname }} (@{{ p.author?.username }}) · 👁 {{ p.viewCount }}
              </div>
              <div class="flex gap-2">
                <el-button size="small" type="danger" plain @click="removePrompt(p.id, p.title)">🗑 删除并通知</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 已发布文章 -->
      <div class="bg-white rounded-xl p-6">
        <h2 class="font-semibold mb-4">📰 已发布文章 ({{ publishedArticles.length }})</h2>
        <div v-if="publishedArticles.length === 0" class="text-center py-10 text-gray-400">暂无已发布文章</div>
        <div v-else class="space-y-4">
          <div v-for="a in publishedArticles" :key="a.id" class="border rounded-xl p-4 hover:bg-gray-50">
            <h3 class="font-semibold mb-2">{{ a.title }}</h3>
            <p class="text-sm text-gray-500 mb-2">{{ a.summary }}</p>
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="text-xs text-gray-400">
                作者：{{ a.author?.nickname }} (@{{ a.author?.username }}) · 👁 {{ a.viewCount }} · {{ new Date(a.createdAt).toLocaleDateString() }}
              </div>
              <div class="flex gap-2">
                <el-button size="small" type="danger" plain @click="removeArticle(a.id, a.title)">🗑 删除并通知</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
