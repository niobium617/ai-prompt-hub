<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import { ElMessage } from 'element-plus';

const router = useRouter();
const categories = ref<any[]>([]);
const title = ref('');
const description = ref('');
const content = ref('');
const categoryId = ref<number | undefined>();
const difficulty = ref(1);
const aiToolIds = ref<number[]>([]);
const aiTools = ref<any[]>([]);

onMounted(async () => {
  const [catRes, toolRes] = await Promise.all([
    api.get('/categories'),
    api.get('/tools'),
  ]);
  categories.value = catRes;
  aiTools.value = toolRes;
});

function flattenCats(cats: any[]): any[] {
  return cats.flatMap(c => [c, ...(c.children || [])]);
}

async function onSubmit() {
  if (!title.value || !content.value || !categoryId.value) {
    return ElMessage.warning('请填写标题、内容和分类');
  }
  await api.post('/prompts', {
    title: title.value,
    description: description.value,
    content: content.value,
    categoryId: categoryId.value,
    difficulty: difficulty.value,
    aiToolIds: aiToolIds.value,
  });
  ElMessage.success('提交成功，等待审核');
  router.push('/user');
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-xl p-6">
      <h1 class="text-xl font-bold mb-6">📤 提交提示词</h1>
      <el-form @submit.prevent="onSubmit" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="title" placeholder="提示词标题" maxlength="200" />
        </el-form-item>
        <el-form-item label="描述" required>
          <el-input v-model="description" type="textarea" :rows="3" placeholder="简要描述这个提示词的用途" />
        </el-form-item>
        <el-form-item label="分类" required>
          <el-select v-model="categoryId" placeholder="选择分类" class="w-full">
            <el-option v-for="c in flattenCats(categories)" :key="c.id" :label="c.parentId ? '  └ ' + c.name : c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-radio-group v-model="difficulty">
            <el-radio :value="1">入门</el-radio>
            <el-radio :value="2">进阶</el-radio>
            <el-radio :value="3">高级</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="适用工具">
          <el-select v-model="aiToolIds" multiple placeholder="选择适用AI工具" class="w-full">
            <el-option v-for="t in aiTools" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Prompt内容" required>
          <el-input v-model="content" type="textarea" :rows="12" placeholder="粘贴完整的 Prompt 内容..." />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" @click="onSubmit">提交审核</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
