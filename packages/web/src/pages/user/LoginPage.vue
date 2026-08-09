<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();
const email = ref('');
const password = ref('');
const loading = ref(false);

async function onSubmit() {
  if (!email.value || !password.value) return ElMessage.warning('请填写完整');
  loading.value = true;
  try {
    await userStore.login(email.value, password.value);
    ElMessage.success('登录成功');
    router.push('/');
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-16">
    <div class="bg-white rounded-xl p-8 shadow-sm">
      <h1 class="text-2xl font-bold text-center mb-8">登录 AI Prompt Hub</h1>
      <el-form @submit.prevent="onSubmit">
        <el-form-item>
          <el-input v-model="email" placeholder="邮箱或用户名" size="large" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="password" type="password" placeholder="密码" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" class="w-full" :loading="loading" @click="onSubmit">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="text-center text-sm text-gray-500">
        还没有账号？<router-link to="/register" class="text-primary-600">立即注册</router-link>
      </div>
    </div>
  </div>
</template>
