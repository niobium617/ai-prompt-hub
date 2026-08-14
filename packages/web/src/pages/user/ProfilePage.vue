<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import api from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import PromptCard from '@/components/PromptCard.vue';

const userStore = useUserStore();
const nickname = ref('');
const bio = ref('');
const myPrompts = ref<any[]>([]);
const myTotal = ref(0);
const myPage = ref(1);
const myPageSize = 10;

async function fetchMyPrompts() {
  const res = await api.get('/user/prompts', { page: myPage.value, pageSize: myPageSize });
  myPrompts.value = res.items;
  myTotal.value = res.total;
}

onMounted(async () => {
  await userStore.init();
  nickname.value = userStore.user?.nickname || '';
  bio.value = userStore.user?.bio || '';
  fetchMyPrompts();
});

async function onSave() {
  await api.put('/user/profile', { nickname: nickname.value, bio: bio.value });
  await userStore.init();
  ElMessage.success('保存成功');
}

// 修改密码
const pwdDialogVisible = ref(false);
const newPassword = ref('');
const confirmPassword = ref('');
const verifyCode = ref('');
const pwdLoading = ref(false);
const codeLoading = ref(false);
let codeTimer: ReturnType<typeof setInterval> | null = null;
const codeCountdown = ref(0);

async function onSendCode() {
  const email = userStore.user?.email;
  if (!email) return ElMessage.warning('账号未绑定邮箱');
  codeLoading.value = true;
  try {
    await api.post('/auth/send-code', { email, purpose: 'change-password' });
    ElMessage.success('验证码已发送到 ' + email);
    codeCountdown.value = 60;
    if (codeTimer) clearInterval(codeTimer);
    codeTimer = setInterval(() => {
      codeCountdown.value--;
      if (codeCountdown.value <= 0 && codeTimer) { clearInterval(codeTimer); codeTimer = null; }
    }, 1000);
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '发送失败');
  }
  codeLoading.value = false;
}

async function onDeletePrompt(p: any) {
  try {
    await ElMessageBox.confirm(`确认删除《${p.title}》？删除后不可恢复`, '删除提示词', {
      type: 'warning',
      confirmButtonText: '确认删除',
      confirmButtonClass: 'el-button--danger',
    });
  } catch {
    return; // 用户取消
  }
  try {
    await api.delete(`/prompts/${p.id}`);
    ElMessage.success('已删除');
    const res = await api.get('/user/prompts', { page: 1, pageSize: 10 });
    myPrompts.value = res.items;
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '删除失败');
  }
}

async function onChangePassword() {
  if (!newPassword.value) return ElMessage.warning('请输入新密码');
  if (newPassword.value.length < 6) return ElMessage.warning('新密码至少6位');
  if (newPassword.value !== confirmPassword.value) return ElMessage.warning('两次密码不一致');
  if (!verifyCode.value) return ElMessage.warning('请输入邮箱验证码');
  pwdLoading.value = true;
  try {
    await api.post('/auth/change-password', {
      newPassword: newPassword.value,
      email: userStore.user?.email,
      code: verifyCode.value,
    });
    ElMessage.success('密码修改成功');
    pwdDialogVisible.value = false;
    newPassword.value = ''; confirmPassword.value = ''; verifyCode.value = '';
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
          <div class="text-lg font-semibold">
            {{ userStore.user?.nickname }}
            <span class="text-sm font-normal text-gray-400">@{{ userStore.user?.username }}</span>
          </div>
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
        <el-form-item label="新密码">
          <el-input v-model="newPassword" type="password" show-password placeholder="至少6位" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="confirmPassword" type="password" show-password placeholder="再次输入新密码" />
        </el-form-item>
        <el-form-item label="邮箱验证">
          <div class="flex gap-2 w-full">
            <el-input v-model="verifyCode" placeholder="6位验证码" maxlength="6" class="flex-1" />
            <el-button :loading="codeLoading" :disabled="codeCountdown > 0" @click="onSendCode">
              {{ codeCountdown > 0 ? codeCountdown + 's' : '发送验证码' }}
            </el-button>
          </div>
          <div class="text-xs text-gray-400 mt-1">验证码将发送至 {{ userStore.user?.email }}</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="pwdLoading" @click="onChangePassword">确认修改</el-button>
      </template>
    </el-dialog>

    <div class="bg-white rounded-xl p-6">
      <h2 class="font-semibold mb-4">📝 我的投稿（共 {{ myTotal }} 条）</h2>
      <div v-if="myPrompts.length" class="space-y-3">
        <div v-for="p in myPrompts" :key="p.id">
          <PromptCard :prompt="p" />
          <div class="flex justify-end mt-1.5">
            <el-button
              size="small" type="danger" plain
              @click="onDeletePrompt(p)"
            >🗑 删除</el-button>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-gray-400 py-8">
        <p>暂无投稿</p>
        <router-link to="/user/submit">
          <el-button type="primary" size="small" class="mt-3">去提交第一个提示词</el-button>
        </router-link>
      </div>
      <!-- 分页 -->
      <div v-if="myTotal > myPageSize" class="flex justify-center mt-4">
        <el-pagination
          v-model:current-page="myPage"
          :page-size="myPageSize"
          :total="myTotal"
          layout="prev, pager, next"
          background
          small
          @current-change="fetchMyPrompts"
        />
      </div>
    </div>
  </div>
</template>
