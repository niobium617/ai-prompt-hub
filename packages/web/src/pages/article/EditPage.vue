<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import { ElMessage } from 'element-plus';
import { renderMarkdown } from '@/utils/sanitize';

const router = useRouter();
const title = ref('');
const summary = ref('');
const content = ref('');
const coverImage = ref('');
const categoryId = ref<number | undefined>();
const categories = ref<any[]>([]);
const uploading = ref(false);
const submitting = ref(false);

// 加载分类
api.get('/categories').then((cats: any) => {
  const flat: any[] = [];
  (cats || []).forEach((c: any) => {
    flat.push({ name: c.name, id: c.id });
    (c.children || []).forEach((sub: any) => flat.push({ name: '  └ ' + sub.name, id: sub.id }));
  });
  categories.value = flat;
});

// 图片上传
async function onUploadImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { ElMessage.warning('图片不超过 5MB'); return; }
  uploading.value = true;
  try {
    const form = new FormData();
    form.append('file', file);
    const res: any = await api.post('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const url = res.url;
    // 插入 Markdown 图片语法
    content.value += `\n![${file.name}](${url})\n`;
    ElMessage.success('图片已插入');
  } catch { ElMessage.error('上传失败'); }
  uploading.value = false;
}

// 发布
async function onPublish() {
  if (!title.value.trim() || !content.value.trim()) { ElMessage.warning('标题和内容必填'); return; }
  submitting.value = true;
  try {
    await api.post('/articles', {
      title: title.value,
      summary: summary.value || title.value,
      content: content.value,
      coverImage: coverImage.value || undefined,
      categoryId: categoryId.value,
    });
    ElMessage.success('发布成功');
    router.push('/');
  } catch { }
  submitting.value = false;
}

// Markdown 预览（DOMPurify 净化，与正式渲染一致）
const previewHtml = computed(() => {
  if (!content.value) return '';
  return renderMarkdown(content.value);
});

// Markdown 工具栏
function insertMd(syntax: string) {
  const ta = document.querySelector('textarea') as HTMLTextAreaElement;
  if (!ta) return;
  const start = ta.selectionStart, end = ta.selectionEnd;
  const sel = content.value.substring(start, end);
  let replacement = '';
  switch (syntax) {
    case 'bold': replacement = `**${sel || '粗体'}**`; break;
    case 'italic': replacement = `*${sel || '斜体'}*`; break;
    case 'h2': replacement = `\n## ${sel || '标题'}\n`; break;
    case 'h3': replacement = `\n### ${sel || '小标题'}\n`; break;
    case 'code': replacement = `\n\`\`\`\n${sel || '代码'}\n\`\`\`\n`; break;
    case 'list': replacement = `\n- ${sel || '列表项'}\n`; break;
    case 'quote': replacement = `\n> ${sel || '引用'}\n`; break;
    case 'link': replacement = `[${sel || '链接文字'}](url)`; break;
  }
  content.value = content.value.substring(0, start) + replacement + content.value.substring(end);
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">📝 发布文章</h1>
    <div class="bg-white rounded-xl p-6 space-y-4">
      <!-- 标题 -->
      <div>
        <label class="text-sm font-semibold mb-1 block">标题 <span class="text-red-500">*</span></label>
        <el-input v-model="title" placeholder="文章标题" maxlength="200" size="large" />
      </div>
      <!-- 摘要 -->
      <div>
        <label class="text-sm font-semibold mb-1 block">摘要</label>
        <el-input v-model="summary" placeholder="一句话概述（可选）" maxlength="500" />
      </div>
      <!-- 分类 -->
      <div>
        <label class="text-sm font-semibold mb-1 block">分类</label>
        <el-select v-model="categoryId" placeholder="选择分类" clearable class="w-full">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </div>
      <!-- Markdown 工具栏 -->
      <div>
        <label class="text-sm font-semibold mb-2 block">内容 <span class="text-red-500">*</span>（Markdown）</label>
        <div class="flex flex-wrap gap-2 mb-3">
          <el-button size="small" @click="insertMd('h2')">H2</el-button>
          <el-button size="small" @click="insertMd('h3')">H3</el-button>
          <el-button size="small" @click="insertMd('bold')"><b>B</b></el-button>
          <el-button size="small" @click="insertMd('italic')"><i>I</i></el-button>
          <el-button size="small" @click="insertMd('code')">&lt;/&gt;</el-button>
          <el-button size="small" @click="insertMd('list')">• 列表</el-button>
          <el-button size="small" @click="insertMd('quote')">"引用</el-button>
          <el-button size="small" @click="insertMd('link')">🔗</el-button>
          <label class="el-button el-button--small cursor-pointer">
            🖼 图片
            <input type="file" accept="image/*" class="hidden" @change="onUploadImage" />
          </label>
          <span v-if="uploading" class="text-sm text-gray-400 self-center">上传中...</span>
        </div>
        <el-input v-model="content" type="textarea" :rows="16" placeholder="Markdown 内容..." />
      </div>
      <!-- 预览 -->
      <div v-if="content" class="border-t pt-4">
        <h3 class="font-semibold mb-3">📄 预览</h3>
        <div class="prose max-w-none bg-gray-50 rounded-xl p-4" v-html="previewHtml"></div>
      </div>
      <!-- 发布按钮 -->
      <div class="flex gap-3 pt-4 border-t">
        <el-button type="primary" size="large" :loading="submitting" @click="onPublish">📤 发布文章</el-button>
        <el-button size="large" @click="router.back()">取消</el-button>
      </div>
    </div>
  </div>
</template>
