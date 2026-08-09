<script setup lang="ts">
import { ref } from 'vue';
import api from '@/api';
import { ElMessage } from 'element-plus';

const originalPrompt = ref('');
const style = ref('professional');
const result = ref<any>(null);
const loading = ref(false);

async function onOptimize() {
  if (!originalPrompt.value.trim()) return ElMessage.warning('请输入原始Prompt');
  loading.value = true;
  try {
    const res = await api.post('/tools/prompt-optimizer', {
      originalPrompt: originalPrompt.value,
      style: style.value,
    });
    result.value = res.data;
  } finally { loading.value = false; }
}

async function onCopy(text: string) {
  await navigator.clipboard.writeText(text);
  ElMessage.success('已复制');
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="bg-white rounded-xl p-6 mb-6">
      <h1 class="text-2xl font-bold mb-6">⚡ Prompt 优化器</h1>
      <el-form label-width="80px">
        <el-form-item label="优化风格">
          <el-radio-group v-model="style">
            <el-radio value="professional">专业详细</el-radio>
            <el-radio value="concise">简洁高效</el-radio>
            <el-radio value="creative">创意发散</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="原始Prompt" required>
          <el-input v-model="originalPrompt" type="textarea" :rows="8" placeholder="粘贴你现有的 Prompt..." />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="onOptimize">⚡ 优化 Prompt</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="result" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl p-6">
        <h3 class="font-semibold text-gray-400 mb-3">原版</h3>
        <pre class="text-sm leading-relaxed whitespace-pre-wrap text-gray-500">{{ result.original }}</pre>
      </div>
      <div class="bg-white rounded-xl p-6 border-2 border-green-300">
        <h3 class="font-semibold text-green-600 mb-3">优化版 ✨</h3>
        <pre class="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">{{ result.optimized }}</pre>
        <el-button type="success" class="mt-4" @click="onCopy(result.optimized)">📋 复制优化版</el-button>
      </div>
    </div>
  </div>
</template>
