<script setup lang="ts">
import { ref } from 'vue';

interface Repo {
  name: string;
  owner: string;
  url: string;
  description: string;
  stars: string;
  language: string;
  tags: string[];
}

const repos = ref<Repo[]>([
  { name: 'awesome-chatgpt-prompts', owner: 'f', url: 'https://github.com/f/awesome-chatgpt-prompts', description: '最全的 ChatGPT 提示词合集，收录数百个高质量 Prompt', stars: '110k+', language: 'Markdown', tags: ['ChatGPT', '提示词合集', '开源'] },
  { name: 'ChatGPT-Next-Web', owner: 'ChatGPTNextWeb', url: 'https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web', description: '跨平台 ChatGPT 网页应用，支持私有部署和多模型', stars: '80k+', language: 'TypeScript', tags: ['ChatGPT', 'Web应用', '私有部署'] },
  { name: 'openai-cookbook', owner: 'openai', url: 'https://github.com/openai/openai-cookbook', description: 'OpenAI 官方示例代码库，含Prompt工程最佳实践', stars: '60k+', language: 'Jupyter Notebook', tags: ['OpenAI', '教程', '官方'] },
  { name: 'prompt-engineering-guide', owner: 'dair-ai', url: 'https://github.com/dair-ai/Prompt-Engineering-Guide', description: '全面的Prompt工程指南，从入门到高级技巧', stars: '50k+', language: 'Jupyter Notebook', tags: ['教程', 'Prompt工程', '进阶'] },
  { name: 'LangChain', owner: 'langchain-ai', url: 'https://github.com/langchain-ai/langchain', description: '最流行的LLM应用开发框架，支持链式Prompt和Agent', stars: '100k+', language: 'Python', tags: ['框架', 'LLM', 'Agent'] },
  { name: 'continue', owner: 'continuedev', url: 'https://github.com/continuedev/continue', description: '开源AI代码助手，IDE插件，支持多种LLM', stars: '20k+', language: 'TypeScript', tags: ['代码助手', 'IDE', 'VSCode'] },
  { name: 'open-interpreter', owner: 'openinterpreter', url: 'https://github.com/openinterpreter/open-interpreter', description: '让LLM在本地运行代码的AI助手，自然语言编程', stars: '55k+', language: 'Python', tags: ['代码执行', '智能助手', '本地'] },
  { name: 'claude-code', owner: 'anthropics', url: 'https://github.com/anthropics/claude-code', description: 'Claude Code — Anthropic官方AI编程CLI工具', stars: '15k+', language: 'TypeScript', tags: ['Claude', 'CLI', '编程'] },
  { name: 'midjourney-prompts', owner: 'willwulfken', url: 'https://github.com/willwulfken/MidJourney-Styles-and-Keywords-Reference', description: 'Midjourney风格与关键词参考大全', stars: '12k+', language: 'Markdown', tags: ['Midjourney', 'AI绘画', '参考'] },
  { name: 'cursor', owner: 'getcursor', url: 'https://github.com/getcursor/cursor', description: 'Cursor AI编程编辑器，基于VSCode的AI-first IDE', stars: '25k+', language: 'TypeScript', tags: ['IDE', 'AI编程', 'VSCode'] },
  { name: 'FastGPT', owner: 'labring', url: 'https://github.com/labring/FastGPT', description: '开源AI知识库问答平台，支持工作流编排', stars: '20k+', language: 'TypeScript', tags: ['知识库', '私有部署', '工作流'] },
  { name: 'ollama', owner: 'ollama', url: 'https://github.com/ollama/ollama', description: '本地运行大语言模型的最简单方式，支持Llama/Mistral等', stars: '100k+', language: 'Go', tags: ['本地LLM', '简易部署', '开源'] },
]);

const guides = ref([
  { icon: '🐙', title: '本项目的 GitHub 仓库', desc: 'AI Prompt Hub 开源代码，欢迎 Star ⭐', url: 'https://github.com/niobium617/ai-prompt-hub' },
  { icon: '📖', title: 'OpenAI Prompt Engineering Guide', desc: 'OpenAI 官方提示词工程最佳实践指南', url: 'https://platform.openai.com/docs/guides/prompt-engineering' },
  { icon: '🔧', title: 'Anthropic Prompt Library', desc: 'Claude 官方提示词库和技巧文档', url: 'https://docs.anthropic.com/en/docs/prompt-library' },
  { icon: '🎨', title: 'Midjourney 官方文档', desc: 'Midjourney 参数、命令、风格参考手册', url: 'https://docs.midjourney.com/' },
]);

function openUrl(url: string) {
  window.open(url, '_blank');
}
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold mb-3">📦 AI 资源与开源项目</h1>
      <p class="text-gray-500">精选 GitHub 开源项目、官方教程、AI 工具资源汇总</p>
    </div>

    <!-- 快速链接 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <div
        v-for="g in guides" :key="g.url"
        @click="openUrl(g.url)"
        class="bg-white rounded-xl p-5 cursor-pointer hover:shadow-md transition border border-gray-100 hover:border-primary-300 flex items-center gap-4"
      >
        <div class="text-2xl">{{ g.icon }}</div>
        <div>
          <div class="font-semibold text-gray-800 text-sm">{{ g.title }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ g.desc }}</div>
        </div>
      </div>
    </div>

    <!-- GitHub 项目列表 -->
    <h2 class="text-xl font-semibold mb-4">💻 GitHub 开源项目精选</h2>
    <div class="space-y-3">
      <div
        v-for="r in repos" :key="r.url"
        @click="openUrl(r.url)"
        class="bg-white rounded-xl p-5 cursor-pointer hover:shadow-md transition border border-gray-100 hover:border-primary-200"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">📁</span>
            <h3 class="font-semibold text-gray-800">{{ r.owner }}/<span class="text-primary-600">{{ r.name }}</span></h3>
          </div>
          <div class="flex items-center gap-2 text-xs text-gray-400">
            <span>⭐ {{ r.stars }}</span>
            <span class="w-2 h-2 rounded-full bg-yellow-400"></span>
            <span>{{ r.language }}</span>
          </div>
        </div>
        <p class="text-sm text-gray-500 mb-3">{{ r.description }}</p>
        <div class="flex gap-2">
          <el-tag v-for="t in r.tags" :key="t" size="small" type="info" effect="plain">{{ t }}</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>
