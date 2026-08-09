<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import api from '@/api';
import { ElMessage } from 'element-plus';
import PromptCard from '@/components/PromptCard.vue';

const userStore = useUserStore();
const nickname = ref('');
const bio = ref('');
const myPrompts = ref<any[]>([]);

onMounted(async () => {
  await userStore.fetchProfile();
  nickname.value = userStore.user?.nickname || '';
  bio.value = userStore.user?.bio || '';
  const res = await api.get('/user/prompts', { params: { page: 1, pageSize: 10 } });
  myPrompts.value = res.items;
});

async function onSave() {
  await api.put('/user/profile', { nickname: nickname.value, bio: bio.value });
  await userStore.fetchProfile();
  ElMessage.success('保存成功');
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-xl p-6 mb-6">
      <h1 class="text-xl font-bold mb-6">个人中心</h1>
      <div class="flex items-center gap-4 mb-6">
        <el-avatar :size="64" :src="userStore.user?.avatarUrl">
          {{ (userStore.user?.nickname || '用')[0] }}
        </el-avatar>
        <div>
          <div class="text-lg font-semibold">{{ userStore.user?.nickname }}</div>
          <div class="text-sm text-gray-500">
            {{ userStore.user?.role === 'admin' ? '管理员' : '普通用户' }} · 积分 {{ userStore.user?.points }}
          </div>
        </div>
      </div>
      <el-form @submit.prevent="onSave">
        <el-form-item label="昵称">
          <el-input v-model="nickname" maxlength="50" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="bio" type="textarea" maxlength="200" :rows="3" />
        </el-form-item>
        <el-button type="primary" @click="onSave">保存修改</el-button>
      </el-form>
    </div>

    <div class="bg-white rounded-xl p-6">
      <h2 class="font-semibold mb-4">📝 我的投稿</h2>
      <div v-if="myPrompts.length" class="space-y-3">
        <PromptCard v-for="p in myPrompts" :key="p.id" :prompt="p" />
      </div>
      <div v-else class="text-center text-gray-400 py-8">
        <p>暂无投稿</p>
        <router-link to="/user/submit">
          <el-button type="primary" size="small" class="mt-3">去提交第一个提示词</el-button>
        </router-link>
      </div>
    </div>
  </div>
</template>
