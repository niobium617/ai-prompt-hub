<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';

const pendingPrompts = ref<any[]>([]);
const pendingArticles = ref<any[]>([]);
const publishedPrompts = ref<any[]>([]);
const publishedArticles = ref<any[]>([]);
const stats = ref<any>({});
const activeTab = ref('pending');

// 分页状态
const promptPage = ref(1);
const promptTotal = ref(0);
const articlePage = ref(1);
const articleTotal = ref(0);
const pageSize = 10;

// 用户管理状态
const users = ref<any[]>([]);
const userTotal = ref(0);
const userPage = ref(1);
const userKeyword = ref('');
let userDebounce: ReturnType<typeof setTimeout>;

onMounted(fetchData);

async function fetchData() {
  const [pRes, aRes, sRes] = await Promise.all([
    api.get('/admin/prompts/pending'),
    api.get('/admin/articles/pending'),
    api.get('/admin/stats'),
  ]);
  pendingPrompts.value = pRes.items;
  pendingArticles.value = aRes.items;
  stats.value = sRes;
}

async function fetchPublished() {
  const [promptsRes, articlesRes] = await Promise.all([
    api.get('/admin/prompts/published', { page: promptPage.value, pageSize }),
    api.get('/admin/articles/published', { page: articlePage.value, pageSize }),
  ]);
  publishedPrompts.value = promptsRes.items;
  promptTotal.value = promptsRes.total;
  publishedArticles.value = articlesRes.items;
  articleTotal.value = articlesRes.total;
}

async function fetchUsers() {
  const res = await api.get('/admin/users', {
    page: userPage.value,
    pageSize,
    keyword: userKeyword.value || undefined,
  });
  users.value = res.items;
  userTotal.value = res.total;
}

function onUserSearch() {
  clearTimeout(userDebounce);
  userDebounce = setTimeout(() => {
    userPage.value = 1;
    fetchUsers();
  }, 300);
}

async function toggleUser(u: any) {
  const action = u.status === 1 ? '禁用' : '启用';
  try {
    await ElMessageBox.confirm(`确认${action}用户「${u.nickname}」？`, action + '用户', { type: 'warning' });
    await api.post(`/admin/users/${u.id}/status`, { status: u.status === 1 ? 0 : 1 });
    ElMessage.success(`已${action}`);
    fetchUsers();
  } catch { /* cancelled */ }
}

async function changeRole(u: any) {
  try {
    const { value } = await ElMessageBox.prompt(
      `修改「${u.nickname}」的角色。可选：user(普通用户) / expert(达人) / admin(管理员)`,
      '修改角色',
      {
        type: 'info',
        confirmButtonText: '确认修改',
        inputValue: u.role,
        inputValidator: (v: string) => ['user', 'expert', 'admin'].includes(v.trim()) || '角色只能是 user/expert/admin',
      },
    );
    await api.post(`/admin/users/${u.id}/role`, { role: value.trim() });
    ElMessage.success('角色已修改');
    fetchUsers();
  } catch { /* cancelled */ }
}

function onTabChange(tab: string) {
  activeTab.value = tab;
  if (tab === 'published') fetchPublished();
  if (tab === 'users') fetchUsers();
}

async function approve(id: number) {
  try {
    await ElMessageBox.confirm('确认通过该提示词？', '审核通过', { type: 'success' });
    await api.post(`/admin/prompts/${id}/approve`);
    ElMessage.success('已通过');
    fetchData();
  } catch { /* cancelled */ }
}

async function reject(id: number) {
  try {
    await ElMessageBox.confirm('确认驳回该提示词？', '审核驳回', { type: 'warning' });
    await api.post(`/admin/prompts/${id}/reject`);
    ElMessage.success('已驳回');
    fetchData();
  } catch { /* cancelled */ }
}

async function approveArticle(id: number) {
  try {
    await ElMessageBox.confirm('确认通过该文章？', '审核通过', { type: 'success' });
    await api.post(`/admin/articles/${id}/approve`);
    ElMessage.success('已通过');
    fetchData();
  } catch { /* cancelled */ }
}

async function rejectArticle(id: number) {
  try {
    await ElMessageBox.confirm('确认驳回该文章？', '审核驳回', { type: 'warning' });
    await api.post(`/admin/articles/${id}/reject`);
    ElMessage.success('已驳回');
    fetchData();
  } catch { /* cancelled */ }
}

/** 通用：删除并通知（提示词/文章） */
async function removeWithReason(url: string, title: string, typeName: string) {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      `删除《${title}》后不可恢复，将通知作者。请填写删除原因：`,
      `删除${typeName}`,
      {
        type: 'warning',
        confirmButtonText: '删除并通知',
        confirmButtonClass: 'el-button--danger',
        inputPlaceholder: '如：内容违规 / 广告 / 重复内容',
        inputValidator: (v: string) => !!v.trim() || '请填写删除原因',
      },
    );
    await api.delete(url, { reason });
    ElMessage.success('已删除并通知作者');
    fetchData();
    if (activeTab.value === 'published') fetchPublished();
  } catch { /* cancelled */ }
}

function removePrompt(id: number, title: string) {
  return removeWithReason(`/admin/prompts/${id}`, title, '提示词');
}

function removeArticle(id: number, title: string) {
  return removeWithReason(`/admin/articles/${id}`, title, '文章');
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 text-center">
        <div class="text-3xl font-bold text-primary-600">{{ stats.promptCount }}</div>
        <div class="text-sm text-gray-500 mt-1">提示词总数</div>
      </div>
      <div class="bg-white rounded-xl p-4 text-center">
        <div class="text-3xl font-bold text-green-600">{{ stats.userCount }}</div>
        <div class="text-sm text-gray-500 mt-1">用户总数</div>
      </div>
      <div class="bg-white rounded-xl p-4 text-center">
        <div class="text-3xl font-bold text-orange-600">{{ stats.articleCount }}</div>
        <div class="text-sm text-gray-500 mt-1">文章总数</div>
      </div>
    </div>

    <!-- 页签切换 -->
    <div class="flex gap-2 mb-4 flex-wrap">
      <el-button :type="activeTab === 'pending' ? 'primary' : 'default'" size="small" @click="onTabChange('pending')">
        待审核 ({{ pendingPrompts.length + pendingArticles.length }})
      </el-button>
      <el-button :type="activeTab === 'published' ? 'primary' : 'default'" size="small" @click="onTabChange('published')">
        已发布内容
      </el-button>
      <el-button :type="activeTab === 'users' ? 'primary' : 'default'" size="small" @click="onTabChange('users')">
        👥 用户管理
      </el-button>
    </div>

    <!-- 待审核 -->
    <div v-if="activeTab === 'pending'" class="space-y-6">
      <!-- 待审核提示词 -->
      <div class="bg-white rounded-xl p-6">
        <h2 class="font-semibold mb-4">📋 待审核提示词 ({{ pendingPrompts.length }})</h2>
        <div v-if="pendingPrompts.length === 0" class="text-center py-12 text-gray-400">
          <div class="text-4xl mb-3">✅</div>
          <p>暂无待审核内容</p>
        </div>
        <div v-else class="space-y-4">
          <div v-for="p in pendingPrompts" :key="p.id" class="border rounded-xl p-4 hover:bg-gray-50">
            <h3 class="font-semibold mb-2">{{ p.title }}</h3>
            <p class="text-sm text-gray-500 mb-2">{{ p.description }}</p>
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="text-xs text-gray-400">
                {{ p.category?.name }} · 作者：{{ p.author?.nickname }} (@{{ p.author?.username }}) · {{ new Date(p.createdAt).toLocaleDateString() }}
              </div>
              <div class="flex gap-2">
                <el-button size="small" type="success" @click="approve(p.id)">通过</el-button>
                <el-button size="small" type="danger" @click="reject(p.id)">驳回</el-button>
                <el-button size="small" type="danger" plain @click="removePrompt(p.id, p.title)">🗑 删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 待审核文章 -->
      <div class="bg-white rounded-xl p-6">
        <h2 class="font-semibold mb-4">📰 待审核文章 ({{ pendingArticles.length }})</h2>
        <div v-if="pendingArticles.length === 0" class="text-center py-12 text-gray-400">
          <div class="text-4xl mb-3">✅</div>
          <p>暂无待审核内容</p>
        </div>
        <div v-else class="space-y-4">
          <div v-for="a in pendingArticles" :key="a.id" class="border rounded-xl p-4 hover:bg-gray-50">
            <h3 class="font-semibold mb-2">{{ a.title }}</h3>
            <p class="text-sm text-gray-500 mb-2">{{ a.summary }}</p>
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="text-xs text-gray-400">
                作者：{{ a.author?.nickname }} (@{{ a.author?.username }}) · {{ new Date(a.createdAt).toLocaleDateString() }}
              </div>
              <div class="flex gap-2">
                <el-button size="small" type="success" @click="approveArticle(a.id)">通过</el-button>
                <el-button size="small" type="danger" @click="rejectArticle(a.id)">驳回</el-button>
                <el-button size="small" type="danger" plain @click="removeArticle(a.id, a.title)">🗑 删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 已发布内容 -->
    <div v-if="activeTab === 'published'" class="space-y-6">
      <!-- 已发布提示词 -->
      <div class="bg-white rounded-xl p-6">
        <h2 class="font-semibold mb-4">📌 已发布提示词（共 {{ promptTotal }} 条）</h2>
        <div v-if="publishedPrompts.length === 0" class="text-center py-10 text-gray-400">暂无已发布提示词</div>
        <div v-else class="space-y-4">
          <div v-for="p in publishedPrompts" :key="p.id" class="border rounded-xl p-4 hover:bg-gray-50">
            <h3 class="font-semibold mb-2">{{ p.title }}</h3>
            <p class="text-sm text-gray-500 mb-2">{{ p.description }}</p>
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="text-xs text-gray-400">
                {{ p.category?.name }} · 作者：{{ p.author?.nickname }} (@{{ p.author?.username }}) · 👁 {{ p.viewCount }}
              </div>
              <div class="flex gap-2">
                <el-button size="small" type="danger" plain @click="removePrompt(p.id, p.title)">🗑 删除并通知</el-button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="promptTotal > pageSize" class="flex justify-center mt-4">
          <el-pagination
            v-model:current-page="promptPage" :page-size="pageSize" :total="promptTotal"
            layout="prev, pager, next" background small @current-change="fetchPublished"
          />
        </div>
      </div>

      <!-- 已发布文章 -->
      <div class="bg-white rounded-xl p-6">
        <h2 class="font-semibold mb-4">📰 已发布文章（共 {{ articleTotal }} 条）</h2>
        <div v-if="publishedArticles.length === 0" class="text-center py-10 text-gray-400">暂无已发布文章</div>
        <div v-else class="space-y-4">
          <div v-for="a in publishedArticles" :key="a.id" class="border rounded-xl p-4 hover:bg-gray-50">
            <h3 class="font-semibold mb-2">{{ a.title }}</h3>
            <p class="text-sm text-gray-500 mb-2">{{ a.summary }}</p>
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="text-xs text-gray-400">
                作者：{{ a.author?.nickname }} (@{{ a.author?.username }}) · 👁 {{ a.viewCount }} · {{ new Date(a.createdAt).toLocaleDateString() }}
              </div>
              <div class="flex gap-2">
                <el-button size="small" type="danger" plain @click="removeArticle(a.id, a.title)">🗑 删除并通知</el-button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="articleTotal > pageSize" class="flex justify-center mt-4">
          <el-pagination
            v-model:current-page="articlePage" :page-size="pageSize" :total="articleTotal"
            layout="prev, pager, next" background small @current-change="fetchPublished"
          />
        </div>
      </div>
    </div>

    <!-- 用户管理 -->
    <div v-if="activeTab === 'users'" class="bg-white rounded-xl p-6">
      <h2 class="font-semibold mb-4">👥 用户管理（共 {{ userTotal }} 人）</h2>
      <!-- 搜索 -->
      <div class="mb-4 max-w-sm">
        <el-input v-model="userKeyword" placeholder="搜索用户名/昵称/邮箱..." clearable @input="onUserSearch" />
      </div>
      <!-- 用户表格 -->
      <el-table :data="users" stripe size="small">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="用户" min-width="140">
          <template #default="{ row }">
            <div class="font-medium">{{ row.nickname }}</div>
            <div class="text-xs text-gray-400">@{{ row.username }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="170" show-overflow-tooltip />
        <el-table-column label="角色" width="90">
          <template #default="{ row }">
            <el-tag size="small" :type="row.role === 'admin' ? 'danger' : row.role === 'expert' ? 'warning' : 'info'">
              {{ row.role === 'admin' ? '管理员' : row.role === 'expert' ? '达人' : '用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="内容" width="90">
          <template #default="{ row }">
            <span class="text-xs text-gray-500">{{ row.promptCount }}词 / {{ row.articleCount }}文</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="70">
          <template #default="{ row }">
            <span :class="row.status === 1 ? 'text-green-600' : 'text-red-500'" class="text-xs">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <div class="flex gap-1.5">
              <el-button size="small" :type="row.status === 1 ? 'warning' : 'success'" plain @click="toggleUser(row)">
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button size="small" type="info" plain @click="changeRole(row)">角色</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div v-if="userTotal > pageSize" class="flex justify-center mt-4">
        <el-pagination
          v-model:current-page="userPage" :page-size="pageSize" :total="userTotal"
          layout="prev, pager, next" background small @current-change="fetchUsers"
        />
      </div>
    </div>
  </div>
</template>
