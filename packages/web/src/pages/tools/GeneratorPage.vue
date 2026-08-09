<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api';
import { ElMessage } from 'element-plus';

const categories = ref<any[]>([]);
const aiTools = ref<any[]>([]);
const selectedCategory = ref('');
const description = ref('');
const selectedTool = ref('');
const result = ref<any>(null);
const loading = ref(false);

onMounted(async () => {
  const [catRes, toolRes] = await Promise.all([
    api.get('/categories'),
    api.get('/tools'),
  ]);
  categories.value = catRes;
  aiTools.value = toolRes.filter((t: any) => t.category === 'text');
});

async function onGenerate() {
  if (!selectedCategory.value || !description.value) return ElMessage.warning('请选择场景并输入需求');
  loading.value = true;
  try {
    const res = await api.post('/tools/prompt-generator', {
      category: selectedCategory.value,
      description: description.value,
      toolName: selectedTool.value || '通用AI',
    });
    result.value = res;
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
      <h1 class="text-2xl font-bold mb-6">🛠️ Prompt 生成器</h1>
      <el-form label-width="80px">
        <el-form-item label="场景分类" required>
          <el-select v-model="selectedCategory" placeholder="选择使用场景" class="w-full">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标工具">
          <el-select v-model="selectedTool" placeholder="选择AI工具" class="w-full">
            <el-option v-for="t in aiTools" :key="t.id" :label="t.name" :value="t.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="需求描述" required>
          <el-input v-model="description" type="textarea" :rows="4" placeholder="描述你想要完成的任务..." />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="onGenerate">⚡ 生成 Prompt</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="result" class="bg-white rounded-xl p-6">
      <h2 class="font-semibold mb-4">✨ 生成结果</h2>
      <pre class="bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto text-sm leading-relaxed whitespace-pre-wrap">{{ result.prompt }}</pre>
      <el-button type="primary" class="mt-4" @click="onCopy(result.prompt)">📋 复制 Prompt</el-button>
    </div>
  </div>
</template>
