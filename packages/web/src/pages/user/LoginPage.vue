<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';
import api from '@/api';

const router = useRouter();
const userStore = useUserStore();

// 密码登录
const mode = ref<'password' | 'code'>('password');
const email = ref('');
const password = ref('');
const loading = ref(false);

// 验证码登录
const codeEmail = ref('');
const code = ref('');
const codeLoading = ref(false);
const codeCountdown = ref(0);
let codeTimer: ReturnType<typeof setInterval> | null = null;

async function onSendCode() {
  if (!codeEmail.value || !codeEmail.value.includes('@')) return ElMessage.warning('请输入正确邮箱');
  codeLoading.value = true;
  try {
    await api.post('/auth/send-code', { email: codeEmail.value, purpose: 'login' });
    ElMessage.success('验证码已发送');
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

// 提取后端错误信息（兼容多种返回格式）
function extractError(e: any): string {
  const msg = e?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join('；');
  if (typeof msg === 'string') return msg;
  return '请求失败，请稍后再试';
}

const loginError = ref('');

async function onPasswordLogin() {
  if (!email.value || !password.value) return ElMessage.warning('请填写完整');
  loading.value = true;
  loginError.value = '';
  try {
    await userStore.login(email.value, password.value);
    ElMessage.success('登录成功');
    router.push('/');
  } catch (e: any) {
    loginError.value = extractError(e);
    ElMessage.error(loginError.value);
  }
  loading.value = false;
}

async function onCodeLogin() {
  if (!codeEmail.value || !code.value) return ElMessage.warning('请填写完整');
  loading.value = true;
  try {
    const res = await api.post('/auth/login/code', { email: codeEmail.value, code: code.value });
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    userStore.token = res.accessToken;
    await userStore.init();
    ElMessage.success('登录成功');
    router.push('/');
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '登录失败');
  }
  loading.value = false;
}
</script>

<template>
  <div class="max-w-md mx-auto mt-10 md:mt-16">
    <div class="bg-white rounded-xl p-6 md:p-8 shadow-sm">
      <h1 class="text-2xl font-bold text-center mb-6">登录 AI Prompt Hub</h1>

      <!-- 登录方式切换 -->
      <div class="flex bg-gray-100 rounded-full p-1 mb-6">
        <div class="flex-1 text-center py-1.5 rounded-full text-sm cursor-pointer transition"
          :class="mode === 'password' ? 'bg-white shadow font-medium text-primary-600' : 'text-gray-500'"
          @click="mode = 'password'">密码登录</div>
        <div class="flex-1 text-center py-1.5 rounded-full text-sm cursor-pointer transition"
          :class="mode === 'code' ? 'bg-white shadow font-medium text-primary-600' : 'text-gray-500'"
          @click="mode = 'code'">验证码登录</div>
      </div>

      <!-- 密码登录 -->
      <el-form v-if="mode === 'password'" @submit.prevent="onPasswordLogin">
        <el-form-item>
          <el-input v-model="email" placeholder="邮箱或用户名" size="large" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="password" type="password" placeholder="密码" size="large" show-password @keyup.enter="onPasswordLogin" />
        </el-form-item>
        <!-- 内联错误提示 -->
        <div v-if="loginError" class="bg-red-50 text-red-500 text-sm rounded-lg px-4 py-2.5 mb-4">
          ⚠️ {{ loginError }}
        </div>
        <el-form-item>
          <el-button type="primary" size="large" class="w-full" :loading="loading" @click="onPasswordLogin">登录</el-button>
        </el-form-item>
      </el-form>

      <!-- 验证码登录 -->
      <el-form v-else @submit.prevent="onCodeLogin">
        <el-form-item>
          <el-input v-model="codeEmail" placeholder="邮箱" size="large" />
        </el-form-item>
        <el-form-item>
          <div class="flex gap-2 w-full">
            <el-input v-model="code" placeholder="6位验证码" maxlength="6" size="large" class="flex-1" @keyup.enter="onCodeLogin" />
            <el-button size="large" :loading="codeLoading" :disabled="codeCountdown > 0" @click="onSendCode">
              {{ codeCountdown > 0 ? codeCountdown + 's' : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" class="w-full" :loading="loading" @click="onCodeLogin">登录</el-button>
        </el-form-item>
        <div class="text-xs text-gray-400 text-center -mt-2 mb-2">首次使用将自动创建账号</div>
      </el-form>

      <div class="text-center text-sm text-gray-500">
        还没有账号？<router-link to="/register" class="text-primary-600">立即注册</router-link>
      </div>
    </div>
  </div>
</template>
