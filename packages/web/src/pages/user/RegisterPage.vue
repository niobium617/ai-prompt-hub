<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';
import api from '@/api';

const router = useRouter();
const userStore = useUserStore();
const username = ref('');
const nickname = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMsg = ref('');

// 用户名合法性：2-20位，字母数字下划线
function validateUsername(v: string): boolean {
  return /^[a-zA-Z0-9_]{2,20}$/.test(v);
}

async function onSubmit() {
  errorMsg.value = '';
  if (!username.value || !email.value || !password.value) {
    errorMsg.value = '请填写完整';
    return;
  }
  if (!validateUsername(username.value)) {
    errorMsg.value = '用户名需为 2-20 位字母、数字或下划线（登录用）';
    return;
  }
  if (password.value.length < 6) {
    errorMsg.value = '密码至少 6 位';
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = '两次密码不一致';
    return;
  }
  loading.value = true;
  try {
    await api.post('/auth/register', {
      username: username.value,
      email: email.value,
      password: password.value,
      nickname: nickname.value || username.value,
    });
    // 注册成功后直接登录
    await userStore.login(username.value, password.value);
    ElMessage.success('注册成功');
    router.push('/');
  } catch (e: any) {
    const msg = e?.response?.data?.message;
    errorMsg.value = Array.isArray(msg) ? msg.join('；') : (msg || '注册失败，请稍后再试');
  }
  loading.value = false;
}
</script>

<template>
  <div class="max-w-md mx-auto mt-10 md:mt-16">
    <div class="bg-white rounded-xl p-6 md:p-8 shadow-sm">
      <h1 class="text-2xl font-bold text-center mb-6">注册 AI Prompt Hub</h1>
      <el-form @submit.prevent="onSubmit">
        <el-form-item>
          <el-input v-model="username" placeholder="用户名（登录用，2-20位字母/数字/下划线）" size="large" maxlength="20" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="nickname" placeholder="昵称（展示用，可重复，可不填）" size="large" maxlength="50" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="email" placeholder="邮箱" size="large" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="password" type="password" placeholder="密码（至少6位）" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-input v-model="confirmPassword" type="password" placeholder="确认密码" size="large" show-password @keyup.enter="onSubmit" />
        </el-form-item>
        <!-- 内联错误提示 -->
        <div v-if="errorMsg" class="bg-red-50 text-red-500 text-sm rounded-lg px-4 py-2.5 mb-4">
          ⚠️ {{ errorMsg }}
        </div>
        <el-form-item>
          <el-button type="primary" size="large" class="w-full" :loading="loading" @click="onSubmit">注册</el-button>
        </el-form-item>
      </el-form>
      <div class="text-center text-sm text-gray-500">
        已有账号？<router-link to="/login" class="text-primary-600">立即登录</router-link>
      </div>
    </div>
  </div>
</template>
