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
  await userStore.init();
  nickname.value = userStore.user?.nickname || '';
  bio.value = userStore.user?.bio || '';
  const res = await api.get('/user/prompts', { params: { page: 1, pageSize: 10 } });
  myPrompts.value = res.items;
});

async function onSave() {
  await api.put('/user/profile', { nickname: nickname.value, bio: bio.value });
  await userStore.init();
  ElMessage.success('保存成功');
}

// 修改密码
const pwdDialogVisible = ref(false);
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const pwdLoading = ref(false);

async function onChangePassword() {
  if (!oldPassword.value || !newPassword.value) return ElMessage.warning('请填写完整');
  if (newPassword.value.length < 6) return ElMessage.warning('新密码至少6位');
  if (newPassword.value !== confirmPassword.value) return ElMessage.warning('两次密码不一致');
  pwdLoading.value = true;
  try {
    await api.post('/auth/change-password', {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    });
    ElMessage.success('密码修改成功');
    pwdDialogVisible.value = false;
    oldPassword.value = ''; newPassword.value = ''; confirmPassword.value = '';
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '修改失败');
  }
  pwdLoading.value = false;
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
        <div class="flex gap-3">
          <el-button type="primary" @click="onSave">保存修改</el-button>
          <el-button @click="pwdDialogVisible = true">🔒 修改密码</el-button>
        </div>
      </el-form>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="pwdDialogVisible" title="修改密码" width="90%" style="max-width: 420px">
      <el-form @submit.prevent="onChangePassword">
        <el-form-item label="原密码">
          <el-input v-model="oldPassword" type="password" show-password placeholder="输入当前密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="newPassword" type="password" show-password placeholder="至少6位" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="confirmPassword" type="password" show-password placeholder="再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="pwdLoading" @click="onChangePassword">确认修改</el-button>
      </template>
    </el-dialog>

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
