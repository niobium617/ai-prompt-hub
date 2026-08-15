<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api, { extractError } from '@/api';
import { ElMessage } from 'element-plus';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const route = useRoute();
const router = useRouter();

const draft = ref<any>(null);
const source = ref<any>(null);
const loading = ref(true);
const saving = ref(false);

// 编辑字段
const title = ref('');
const description = ref('');
const content = ref('');

// 视图模式：source 原始 / draft 草稿 / compare 对照
const viewMode = ref<'source' | 'draft' | 'compare'>('draft');

const draftId = computed(() => Number(route.params.id));

onMounted(async () => {
  try {
    const res = await api.get(`/drafts/${draftId.value}`);
    draft.value = res.draft;
    source.value = res.source;
    title.value = res.draft.title;
    description.value = res.draft.description;
    content.value = res.draft.content;
  } catch (e: any) {
    ElMessage.error(extractError(e));
    router.back();
  }
  loading.value = false;
});

async function onSave() {
  if (!title.value.trim()) return ElMessage.warning('标题不能为空');
  saving.value = true;
  try {
    const res = await api.put(`/drafts/${draftId.value}`, {
      title: title.value,
      description: description.value,
      content: content.value,
    });
    draft.value = res;
    ElMessage.success('草稿已保存');
  } catch (e: any) {
    ElMessage.error(extractError(e));
  }
  saving.value = false;
}

const deleteVisible = ref(false);

async function onDelete() {
  deleteVisible.value = true;
}

async function doDelete() {
  deleteVisible.value = false;
  try {
    await api.delete(`/drafts/${draftId.value}`);
    ElMessage.success('已删除');
    router.push('/user/drafts');
  } catch (e: any) {
    ElMessage.error(extractError(e));
  }
}

/** 当前显示的版本（用于单一视图） */
const isDraftView = computed(() => viewMode.value === 'draft');
const showSource = computed(() => viewMode.value === 'source' || viewMode.value === 'compare');
const showDraft = computed(() => viewMode.value === 'draft' || viewMode.value === 'compare');
</script>

<template>
  <div v-if="loading" class="max-w-6xl mx-auto text-center py-20 text-gray-400">加载中...</div>

  <div v-else class="max-w-6xl mx-auto">
    <!-- 顶部操作栏 -->
    <div class="bg-white rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
      <el-button size="small" @click="router.back()">← 返回</el-button>
      <div class="flex-1 min-w-0">
        <h1 class="font-semibold truncate">{{ title || '未命名草稿' }}</h1>
        <div class="text-xs text-gray-400 mt-0.5">
          🔒 私有草稿 · 基于 <span class="text-primary-500">{{ source?.title }}</span> 创建
        </div>
      </div>
      <div class="flex gap-2">
        <el-button size="small" type="danger" plain @click="onDelete">🗑 删除</el-button>
        <el-button size="small" type="primary" :loading="saving" @click="onSave">💾 保存草稿</el-button>
      </div>
    </div>

    <!-- 版本切换 -->
    <div class="bg-white rounded-xl p-1.5 mb-4 flex gap-1 max-w-md">
      <button
        v-for="m in [
          { key: 'draft', label: '✏️ 我的草稿' },
          { key: 'source', label: '📄 原始版本' },
          { key: 'compare', label: '🔍 对照查看' },
        ]" :key="m.key"
        @click="viewMode = m.key as any"
        class="flex-1 py-2 rounded-lg text-sm transition font-medium"
        :class="viewMode === m.key ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-50'"
      >{{ m.label }}</button>
    </div>

    <!-- 对照视图：双栏 -->
    <div v-if="viewMode === 'compare'" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- 原始版本（只读） -->
      <div class="bg-white rounded-xl p-5 border border-gray-200">
        <div class="flex items-center gap-2 mb-3">
          <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">原始版本 · 只读</span>
          <h3 class="font-semibold text-sm truncate">{{ source?.title }}</h3>
        </div>
        <p class="text-xs text-gray-500 mb-3">{{ source?.description }}</p>
        <pre class="bg-gray-50 border rounded-lg p-4 text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">{{ source?.content }}</pre>
      </div>
      <!-- 我的草稿（可编辑） -->
      <div class="bg-white rounded-xl p-5 border-2 border-primary-200">
        <div class="flex items-center gap-2 mb-3">
          <span class="px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 text-xs font-medium">我的草稿 · 私有</span>
          <h3 class="font-semibold text-sm truncate">{{ title || '未命名' }}</h3>
        </div>
        <el-input v-model="title" placeholder="标题" size="small" class="mb-2" />
        <el-input v-model="description" type="textarea" :rows="2" placeholder="描述" class="mb-2" />
        <el-input v-model="content" type="textarea" :rows="14" placeholder="Prompt 内容" />
      </div>
    </div>

    <!-- 单版视图 -->
    <div v-else class="bg-white rounded-xl p-5">
      <!-- 原始版本只读 -->
      <div v-if="viewMode === 'source'">
        <div class="flex items-center gap-2 mb-3">
          <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">原始版本 · 只读</span>
          <h3 class="font-semibold">{{ source?.title }}</h3>
        </div>
        <p class="text-sm text-gray-500 mb-4">{{ source?.description }}</p>
        <pre class="bg-gray-900 text-green-400 p-5 rounded-xl overflow-x-auto text-sm leading-relaxed whitespace-pre-wrap">{{ source?.content }}</pre>
      </div>
      <!-- 草稿编辑 -->
      <div v-else>
        <div class="flex items-center gap-2 mb-4">
          <span class="px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 text-xs font-medium">我的草稿 · 私有</span>
        </div>
        <el-form label-position="top">
          <el-form-item label="标题">
            <el-input v-model="title" placeholder="提示词标题" maxlength="200" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="description" type="textarea" :rows="3" placeholder="简要描述用途" />
          </el-form-item>
          <el-form-item label="Prompt 内容">
            <el-input v-model="content" type="textarea" :rows="16" placeholder="Prompt 内容..." />
          </el-form-item>
        </el-form>
        <div class="flex justify-end gap-2 mt-4">
          <el-button type="primary" :loading="saving" @click="onSave">💾 保存草稿</el-button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <ConfirmDialog
      :visible="deleteVisible"
      title="删除草稿"
      message="确认删除该草稿？删除后不可恢复"
      danger
      confirm-text="确认删除"
      @confirm="doDelete"
      @cancel="deleteVisible = false"
    />
  </div>
</template>
