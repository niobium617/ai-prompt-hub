<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api, { extractError } from '@/api';
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
const exampleImages = ref<string[]>([]);
const uploadingImg = ref(false);

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

/** 上传效果示例图 */
async function onUploadImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { ElMessage.warning('图片不超过 5MB'); return; }
  uploadingImg.value = true;
  try {
    const form = new FormData();
    form.append('file', file);
    const res: any = await api.post('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    exampleImages.value.push(res.url);
    ElMessage.success('图片已添加');
  } catch (e: any) {
    ElMessage.error(extractError(e));
  }
  uploadingImg.value = false;
}

function removeImage(i: number) {
  exampleImages.value.splice(i, 1);
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
    exampleImages: exampleImages.value,
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
        <el-form-item label="效果示例">
          <div class="w-full">
            <div class="flex flex-wrap gap-3 mb-3">
              <div v-for="(img, i) in exampleImages" :key="img" class="relative">
                <img :src="img" class="w-24 h-24 object-cover rounded-lg border" />
                <button
                  type="button"
                  class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                  @click="removeImage(i)"
                >×</button>
              </div>
              <label class="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition">
                <span class="text-2xl text-gray-400">{{ uploadingImg ? '...' : '＋' }}</span>
                <span class="text-xs text-gray-400 mt-1">添加图片</span>
                <input type="file" accept="image/*" class="hidden" @change="onUploadImage" />
              </label>
            </div>
            <div class="text-xs text-gray-400">可选：上传效果示例图（最多不限，单张 ≤5MB）</div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" @click="onSubmit">提交审核</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
