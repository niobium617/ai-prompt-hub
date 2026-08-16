<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api';
import PromptCard from '@/components/PromptCard.vue';

const route = useRoute();
const prompts = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const categoryId = ref<number | undefined>();
const sort = ref('newest');
const difficulty = ref<number | undefined>();
const categories = ref<any[]>([]);
const loading = ref(false);

onMounted(async () => {
  const catRes = await api.get('/categories');
  categories.value = catRes;
  categoryId.value = Number(route.query.categoryId) || undefined;
  fetchPrompts();
});

watch([page, sort, difficulty, categoryId], () => fetchPrompts());

async function fetchPrompts() {
  loading.value = true;
  try {
    const res = await api.get('/prompts', {
      page: page.value,
      pageSize: 12,
      categoryId: categoryId.value,
      difficulty: difficulty.value,
      sort: sort.value,
    });
    prompts.value = res.items;
    total.value = res.total;
  } catch (e: any) {
    const msg = e?.response?.data?.message;
    console.error('加载失败:', Array.isArray(msg) ? msg.join('；') : (msg || e.message));
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <!-- 顶部横向筛选栏（B站同款） -->
    <div class="bg-white rounded-xl p-4 mb-4">
      <!-- 分类行 -->
      <div class="flex items-start mb-3">
        <span class="w-12 flex-shrink-0 text-sm text-gray-400 pt-1.5">分类</span>
        <div class="flex flex-wrap gap-2 flex-1">
          <button
            @click="categoryId = undefined"
            class="px-3.5 py-1.5 rounded-full text-sm transition"
            :class="categoryId === undefined ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >全部</button>
          <button
            v-for="c in categories" :key="c.id"
            @click="categoryId = categoryId === c.id ? undefined : c.id"
            class="px-3.5 py-1.5 rounded-full text-sm transition"
            :class="categoryId === c.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >{{ c.name }}</button>
        </div>
      </div>

      <!-- 难度行 -->
      <div class="flex items-start mb-3">
        <span class="w-12 flex-shrink-0 text-sm text-gray-400 pt-1.5">难度</span>
        <div class="flex flex-wrap gap-2 flex-1">
          <button
            v-for="d in [{v: undefined, l: '全部'}, {v: 1, l: '入门'}, {v: 2, l: '进阶'}, {v: 3, l: '高级'}]"
            :key="d.l"
            @click="difficulty = d.v"
            class="px-3.5 py-1.5 rounded-full text-sm transition"
            :class="difficulty === d.v ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >{{ d.l }}</button>
        </div>
      </div>

      <!-- 排序行 -->
      <div class="flex items-start">
        <span class="w-12 flex-shrink-0 text-sm text-gray-400 pt-1.5">排序</span>
        <div class="flex flex-wrap gap-2 flex-1">
          <button
            v-for="s in [{v: 'newest', l: '最新'}, {v: 'hot', l: '最热'}, {v: 'rating', l: '评分'}]"
            :key="s.v"
            @click="sort = s.v"
            class="px-3.5 py-1.5 rounded-full text-sm transition"
            :class="sort === s.v ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >{{ s.l }}</button>
        </div>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">提示词广场</h2>
      <span class="text-sm text-gray-500">共 {{ total }} 条</span>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:min-h-[788px]">
      <div v-for="i in 6" :key="i" class="bg-white rounded-xl p-5 animate-pulse">
        <div class="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>

    <div v-else-if="prompts.length === 0" class="text-center py-20 text-gray-400">
      <div class="text-5xl mb-4">📭</div>
      <p>暂无提示词</p>
    </div>

    <!-- lg:min-h 按 3列×4行预留空间，分页切换高度恒定不跳动 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:min-h-[788px]">
      <PromptCard v-for="p in prompts" :key="p.id" :prompt="p" />
    </div>

    <div v-if="total > 12" class="flex justify-center mt-8">
      <el-pagination
        v-model:current-page="page"
        :page-size="12"
        :total="total"
        layout="prev, pager, next"
        background
      />
    </div>
  </div>
</template>
