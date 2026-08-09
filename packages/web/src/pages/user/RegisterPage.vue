<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

async function onSubmit() {
  if (!username.value || !email.value || !password.value) return ElMessage.warning('请填写完整');
  if (password.value !== confirmPassword.value) return ElMessage.warning('两次密码不一致');
  loading.value = true;
  try {
    await userStore.register(username.value, email.value, password.value);
    ElMessage.success('注册成功');
    router.push('/');
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '注册失败');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-16">
    <div class="bg-white rounded-xl p-8 shadow-sm">
      <h1 class="text-2xl font-bold text-center mb-8">注册 AI Prompt Hub</h1>
      <el-form @submit.prevent="onSubmit">
        <el-form-item>
          <el-input v-model="username" placeholder="用户名" size="large" maxlength="50" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="email" placeholder="邮箱" size="large" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="password" type="password" placeholder="密码（至少6位）" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-input v-model="confirmPassword" type="password" placeholder="确认密码" size="large" show-password />
        </el-form-item>
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
