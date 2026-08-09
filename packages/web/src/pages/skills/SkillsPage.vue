<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api';

interface Skill {
  id: number;
  title: string;
  icon: string;
  description: string;
  level: string;
  tags: string[];
}

const skills = ref<Skill[]>([]);

onMounted(async () => {
  // 精选 Prompt 技巧分类
  skills.value = [
    { id: 1, icon: '🎯', title: '角色设定法', level: '入门', tags: ['通用', '高效'], description: '给AI一个明确的角色身份，如"你是一位资深Python开发者"，能显著提升回答质量。角色越具体，AI输出越专业。' },
    { id: 2, icon: '📋', title: '分步指令法', level: '入门', tags: ['通用', '结构化'], description: '将复杂任务拆解为Step 1、Step 2...的步骤序列，引导AI逐步完成。适用于写作、代码、分析等场景。' },
    { id: 3, icon: '🔍', title: '反向提问法', level: '进阶', tags: ['创意', '深度'], description: '让AI在回答前先向你提问澄清需求，避免理解偏差。尤其适用于复杂或开放性问题。' },
    { id: 4, icon: '📝', title: '示例驱动法', level: '进阶', tags: ['精准', '高效'], description: '提供1-3个输入输出示例(few-shot)，让AI理解你期望的格式、风格和深度。' },
    { id: 5, icon: '🔄', title: '迭代优化法', level: '进阶', tags: ['优化', '精细'], description: '先让AI给出初稿，再通过"更简洁/更专业/更创意"等指令迭代优化。多轮对话逐步逼近目标。' },
    { id: 6, icon: '🧩', title: '模板变量法', level: '高级', tags: ['复用', '工程化'], description: '使用{{变量名}}创建可复用的Prompt模板，如{{topic}}、{{style}}等，适配不同输入。' },
    { id: 7, icon: '🌐', title: '多语言翻译技巧', level: '进阶', tags: ['翻译', '精准'], description: '指定源语言和目标语言，要求保留原文风格和术语，并提供翻译说明。' },
    { id: 8, icon: '💡', title: '创意发散法', level: '入门', tags: ['创意', '灵活'], description: '使用"头脑风暴"、"给我10个创意"等指令，让AI产生大量想法再进行筛选。' },
    { id: 9, icon: '📊', title: '数据格式约束', level: '高级', tags: ['结构化', '精准'], description: '明确要求输出JSON/Markdown表格等结构化格式，便于后续程序处理。' },
    { id: 10, icon: '🎭', title: '多角色对话法', level: '高级', tags: ['创意', '复杂'], description: '让AI同时扮演多个角色进行辩论或协同，获得多角度分析和创意碰撞。' },
    { id: 11, icon: '📸', title: '图像生成提示词', level: '进阶', tags: ['Midjourney', 'SD'], description: '主体描述 + 风格词 + 画质词 + 参数。从具体到抽象，用逗号分隔关键词。' },
    { id: 12, icon: '🔗', title: '链式思维法', level: '高级', tags: ['推理', '逻辑'], description: '要求AI"逐步思考"(Chain of Thought)，展示推理过程而非直接给答案。适用于数学、逻辑题。' },
  ];
});
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold mb-3">🎯 Prompt 技巧大全</h1>
      <p class="text-gray-500">掌握这些技巧，让 AI 输出质量提升 10 倍</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="s in skills" :key="s.id"
        class="bg-white rounded-xl p-6 hover:shadow-lg transition border border-gray-100 hover:border-primary-200"
      >
        <div class="flex items-start gap-4">
          <div class="text-3xl flex-shrink-0">{{ s.icon }}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-semibold text-gray-800">{{ s.title }}</h3>
              <el-tag :type="s.level === '入门' ? 'success' : s.level === '进阶' ? 'warning' : 'danger'" size="small">{{ s.level }}</el-tag>
            </div>
            <p class="text-sm text-gray-500 leading-relaxed mb-3">{{ s.description }}</p>
            <div class="flex gap-2">
              <el-tag v-for="t in s.tags" :key="t" size="small" type="info" effect="plain">{{ t }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-12 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-2xl p-8 text-white text-center">
      <h2 class="text-2xl font-bold mb-3">🚀 想实战练习？</h2>
      <p class="opacity-90 mb-6">使用 Prompt 生成器和优化器，将技巧立即应用到实际场景</p>
      <div class="flex gap-4 justify-center">
        <router-link to="/tools/generator">
          <el-button type="warning" size="large">生成器 →</el-button>
        </router-link>
        <router-link to="/tools/optimizer">
          <el-button type="default" size="large" class="!bg-white/20 !text-white !border-white/30">优化器 →</el-button>
        </router-link>
      </div>
    </div>
  </div>
</template>
