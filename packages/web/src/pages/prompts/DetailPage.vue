<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api, { extractError } from '@/api';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const prompt = ref<any>(null);
const comments = ref<any[]>([]);
const commentText = ref('');
const userRating = ref(0);

onMounted(async () => {
  const id = route.params.id as string;
  const res = await api.get(`/prompts/${id}`);
  prompt.value = res;
  fetchComments();
});

async function fetchComments() {
  const res = await api.get('/comments', { targetType: 'prompt', targetId: route.params.id });
  comments.value = res.items;
}

async function onCopy() {
  await navigator.clipboard.writeText(prompt.value.content);
  await api.post(`/prompts/${prompt.value.id}/copy`);
  ElMessage.success('已复制到剪贴板');
}

async function onFavorite() {
  if (!userStore.isLoggedIn) return ElMessage.warning('请先登录');
  await api.post('/user/favorites', { targetType: 'prompt', targetId: prompt.value.id });
  ElMessage.success('已收藏');
}

async function onRate(score: number) {
  if (!userStore.isLoggedIn) return ElMessage.warning('请先登录');
  await api.post(`/prompts/${prompt.value.id}/rate`, { score });
  userRating.value = score;
  ElMessage.success('评分成功');
}

async function onSubmitComment() {
  if (!commentText.value.trim()) return;
  await api.post('/comments', { targetType: 'prompt', targetId: prompt.value.id, content: commentText.value });
  commentText.value = '';
  ElMessage.success('评论成功');
  fetchComments();
}

// 基于此创建草稿
const creatingDraft = ref(false);
async function onCreateDraft() {
  if (!userStore.isLoggedIn) return ElMessage.warning('请先登录');
  creatingDraft.value = true;
  try {
    const draft = await api.post('/drafts', { sourcePromptId: prompt.value.id });
    ElMessage.success('草稿已创建');
    router.push(`/drafts/${draft.id}`);
  } catch (e: any) {
    ElMessage.error(extractError(e));
  }
  creatingDraft.value = false;
}
</script>

<template>
  <div v-if="prompt" class="max-w-4xl mx-auto">
    <!-- 标题区 -->
    <div class="bg-white rounded-xl p-6 mb-6">
      <div class="flex items-center gap-3 mb-4">
        <el-tag>{{ prompt.category?.name }}</el-tag>
        <el-tag v-if="prompt.difficulty === 1" type="success">入门</el-tag>
        <el-tag v-else-if="prompt.difficulty === 2" type="warning">进阶</el-tag>
        <el-tag v-else type="danger">高级</el-tag>
        <el-tag v-if="prompt.isFeatured" type="warning">精选</el-tag>
      </div>
      <h1 class="text-2xl font-bold mb-3">{{ prompt.title }}</h1>
      <p class="text-gray-500 mb-4">{{ prompt.description }}</p>
      <div class="flex items-center gap-4 text-sm text-gray-400">
        <span>作者：{{ prompt.author?.nickname }} <span class="text-gray-300">@{{ prompt.author?.username }}</span></span>
        <span>👁 {{ prompt.viewCount }}</span>
        <span>⭐ {{ prompt.ratingAvg }}</span>
        <span>❤ {{ prompt.favoriteCount }}</span>
        <span>📋 使用 {{ prompt.useCount }} 次</span>
      </div>
    </div>

    <!-- Prompt 内容 -->
    <div class="bg-white rounded-xl p-6 mb-6">
      <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 class="font-semibold text-lg">📝 Prompt 内容</h2>
        <div class="flex gap-2">
          <el-button type="primary" @click="onCopy">📋 一键复制</el-button>
          <el-button type="success" plain :loading="creatingDraft" @click="onCreateDraft">✏️ 基于此创建草稿</el-button>
        </div>
      </div>
      <pre class="bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto text-sm leading-relaxed whitespace-pre-wrap">{{ prompt.content }}</pre>
      <div class="text-xs text-gray-400 mt-3">
        💡 「基于此创建草稿」会复制一份到你的私有草稿，可自由修改，不会影响公共原版。
      </div>
    </div>

    <!-- 评分 -->
    <div class="bg-white rounded-xl p-6 mb-6">
      <h2 class="font-semibold text-lg mb-3">⭐ 评分</h2>
      <div class="flex items-center gap-2">
        <span
          v-for="s in 5" :key="s"
          @click="onRate(s)"
          class="text-2xl cursor-pointer transition"
          :class="s <= userRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'"
        >★</span>
        <span class="text-sm text-gray-400 ml-2">当前 {{ prompt.ratingAvg }} 分 ({{ prompt.ratingCount }} 人评分)</span>
      </div>
    </div>

    <!-- 评论区 -->
    <div class="bg-white rounded-xl p-6">
      <h2 class="font-semibold text-lg mb-4">💬 评论 ({{ comments.length }})</h2>
      <div v-if="userStore.isLoggedIn && (!userStore.devMode || userStore.isDevTester)" class="flex gap-3 mb-6">
        <el-input v-model="commentText" placeholder="写下你的评论..." type="textarea" :rows="3" />
        <el-button type="primary" @click="onSubmitComment" class="self-end">发表</el-button>
      </div>
      <div v-else-if="userStore.devMode" class="bg-orange-50 text-orange-600 text-sm rounded-lg px-4 py-3 mb-6">
        🔧 开发模式：评论功能暂仅限测试账号
      </div>
      <div v-for="c in comments" :key="c.id" class="border-b py-4 last:border-0">
        <div class="flex items-center gap-2 mb-2">
          <span class="font-medium text-sm">{{ c.user?.nickname }}</span>
          <span class="text-xs text-gray-400">{{ new Date(c.createdAt).toLocaleDateString() }}</span>
        </div>
        <p class="text-gray-600 text-sm">{{ c.content }}</p>
        <div class="flex gap-4 mt-2 text-xs text-gray-400">
          <span @click="api.post(`/comments/${c.id}/like`)" class="cursor-pointer hover:text-primary-500">👍 {{ c.likeCount }}</span>
          <span class="cursor-pointer hover:text-primary-500">回复</span>
        </div>
      </div>
    </div>
  </div>
</template>
