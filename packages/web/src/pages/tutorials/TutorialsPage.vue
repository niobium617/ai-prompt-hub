<script setup lang="ts">
import { ref } from 'vue';

interface Tutorial {
  id: number;
  title: string;
  icon: string;
  category: string;
  description: string;
  githubUrl: string;
  githubDesc: string;
  usageSteps: string[];
  promptExample: string;
  tags: string[];
}

const tutorials = ref<Tutorial[]>([
  {
    id: 1, icon: '🤖', title: 'ChatGPT 高效使用指南', category: 'AI对话',
    description: 'OpenAI 的 ChatGPT 是目前最流行的AI对话工具。本教程教你如何写出高质量 Prompt，充分利用 ChatGPT 的能力。',
    githubUrl: 'https://github.com/f/awesome-chatgpt-prompts',
    githubDesc: 'awesome-chatgpt-prompts — 收录 200+ 高质量 ChatGPT Prompt 模板，可直接复制使用',
    usageSteps: [
      '访问 chat.openai.com 注册账号',
      '从 awesome-chatgpt-prompts 仓库选择合适的 Prompt 模板',
      '将模板中的 {{变量}} 替换为你的实际需求',
      '发送给 ChatGPT，根据回复迭代优化',
    ],
    promptExample: '你是一位资深{{领域}}专家。请用简洁的语言解释 {{概念}}，并给出3个实际应用案例。',
    tags: ['ChatGPT', 'OpenAI', 'Prompt工程', '入门'],
  },
  {
    id: 2, icon: '🧠', title: 'Claude 深度使用教程', category: 'AI对话',
    description: 'Anthropic 的 Claude 擅长长文本理解和复杂推理。本教程介绍 Claude 的独特优势和使用技巧。',
    githubUrl: 'https://github.com/anthropics/claude-code',
    githubDesc: 'claude-code — Anthropic 官方 CLI 工具，可在终端中直接使用 Claude 进行编程',
    usageSteps: [
      '访问 claude.ai 注册或使用 Claude Code CLI',
      '利用 Claude 的长上下文优势（200K tokens）处理大型文档',
      '使用 "逐步思考" 策略让 Claude 展示推理过程',
      '通过 Claude Code 在终端中直接进行代码生成和调试',
    ],
    promptExample: '请分析以下文档的核心观点，列出5个关键论点，并用表格形式对比它们的优缺点。\n\n文档内容：\n{{document}}',
    tags: ['Claude', 'Anthropic', '长文本', 'CLI'],
  },
  {
    id: 3, icon: '🎨', title: 'Midjourney AI绘画入门到精通', category: 'AI绘画',
    description: 'Midjourney 是最强大的AI图像生成工具之一。学会写Prompt是出好图的关键。',
    githubUrl: 'https://github.com/willwulfken/MidJourney-Styles-and-Keywords-Reference',
    githubDesc: 'MidJourney-Styles-and-Keywords-Reference — 最全的 MJ 风格关键词参考库',
    usageSteps: [
      '加入 Midjourney Discord 服务器并订阅套餐',
      '在 /imagine 命令后输入 Prompt，格式：主体+风格+画质+参数',
      '参考 GitHub 关键词库选择合适的风格词和参数',
      '使用 --ar 设置宽高比，--v 6.0 使用最新模型',
      '通过 U/V 按钮放大或变体，迭代到满意为止',
    ],
    promptExample: 'A serene Japanese garden at sunrise, cherry blossoms falling, koi fish in pond, soft morning light, photorealistic, 8k, shot on Canon EOS R5, 85mm lens --ar 16:9 --style raw --v 6.0',
    tags: ['Midjourney', 'AI绘画', '关键词', '设计'],
  },
  {
    id: 4, icon: '💻', title: 'GitHub Copilot 编程助手', category: 'AI编程',
    description: 'GitHub Copilot 是 AI 代码补全工具，支持 VS Code、JetBrains 等主流 IDE，大幅提升编码效率。',
    githubUrl: 'https://github.com/features/copilot',
    githubDesc: 'GitHub Copilot — 官方页面，支持代码补全、Chat、CLI 多种使用方式',
    usageSteps: [
      '在 VS Code 插件市场安装 GitHub Copilot 扩展',
      '登录 GitHub 账号并激活订阅（学生免费）',
      '写注释描述需求，Copilot 自动生成代码',
      '使用 Ctrl+I 打开 Copilot Chat 进行对话式编程',
      '选中代码后使用 /fix 命令自动修复 Bug',
    ],
    promptExample: '// 写一个 Python 函数，接收 CSV 文件路径，读取数据，计算每列的平均值和标准差，返回 DataFrame\n// 使用 pandas 和 numpy',
    tags: ['Copilot', '编程', 'VSCode', 'GitHub'],
  },
  {
    id: 5, icon: '🦙', title: 'Ollama 本地运行开源大模型', category: '本地部署',
    description: 'Ollama 让你在个人电脑上一键运行 Llama、Mistral、Qwen 等开源模型，无需联网，保护数据隐私。',
    githubUrl: 'https://github.com/ollama/ollama',
    githubDesc: 'ollama — 本地运行 LLM 最简单的方式，支持 macOS/Linux/Windows',
    usageSteps: [
      '访问 ollama.com 下载安装对应系统版本',
      '终端运行：ollama run llama3 （下载并启动 Llama 3）',
      '或用：ollama run qwen2 （启动通义千问 2）',
      '通过 REST API http://localhost:11434 集成到你的应用中',
      '配合 Open WebUI 或 Chatbox 获得图形界面',
    ],
    promptExample: 'ollama run llama3\n>>> 请用Python写一个Flask API服务，包含用户注册、登录、JWT认证三个接口',
    tags: ['Ollama', '本地LLM', '开源', '隐私'],
  },
  {
    id: 6, icon: '🔗', title: 'LangChain 构建 AI 应用', category: 'AI开发框架',
    description: 'LangChain 是构建 LLM 应用的主流框架，支持链式调用、Agent、RAG、Memory 等高级功能。',
    githubUrl: 'https://github.com/langchain-ai/langchain',
    githubDesc: 'langchain — 开源 LLM 应用开发框架，Python/JS 双语言支持',
    usageSteps: [
      'pip install langchain langchain-openai',
      '创建 Chain：定义 Prompt 模板 → 调用 LLM → 解析输出',
      '使用 VectorStore + Embeddings 构建 RAG 知识库问答',
      '通过 Agent 让 LLM 自动选择工具（搜索、计算、API调用）',
      '使用 Memory 实现多轮对话上下文记忆',
    ],
    promptExample: `from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template("你是{role}，请回答：{question}")
model = ChatOpenAI(model="gpt-4")
chain = prompt | model
response = chain.invoke({"role": "Python专家", "question": "解释装饰器"})`,
    tags: ['LangChain', 'Python', 'RAG', 'Agent', '框架'],
  },
  {
    id: 7, icon: '📚', title: 'Dify 低代码 AI 应用平台', category: 'AI开发框架',
    description: 'Dify 是开源 LLMOps 平台，可视化编排 AI 工作流、知识库、对话机器人，无需写代码。',
    githubUrl: 'https://github.com/langgenius/dify',
    githubDesc: 'dify — 开源 AI 应用开发平台，支持可视化 Prompt 编排和多模型接入',
    usageSteps: [
      '克隆仓库并用 docker compose up -d 一键启动',
      '在 Web 界面创建应用：对话型/文本生成型/Agent型',
      '配置 Prompt 模板和变量，可视化调试',
      '上传文档到知识库，开启 RAG 问答',
      '通过 API 将应用集成到你自己的产品中',
    ],
    promptExample: '在 Dify 中创建"客服助手"应用 → 添加知识库（产品文档）→ 设置 System Prompt："你是专业客服，根据知识库回答用户问题" → 发布 API',
    tags: ['Dify', '低代码', '知识库', '可视化'],
  },
  {
    id: 8, icon: '🔍', title: 'Perplexity AI 智能搜索', category: 'AI搜索',
    description: 'Perplexity 是AI驱动的搜索引擎，能直接给出带引用的答案，适合研究和学习。',
    githubUrl: 'https://github.com/zaiste/awesome-perplexity',
    githubDesc: 'awesome-perplexity — Perplexity 使用技巧和 Prompt 模板合集',
    usageSteps: [
      '访问 perplexity.ai 注册免费账号',
      '使用 "Focus" 功能限定搜索范围（学术/视频/社交）',
      '用 Pro Search 模式进行深度学习研究',
      '开启 Collections 功能组织你的研究主题',
    ],
    promptExample: 'Compare the performance of React 19 Server Components vs traditional SSR. Include benchmark data and use case recommendations.',
    tags: ['Perplexity', '搜索', '研究', '引用'],
  },
  {
    id: 9, icon: '🎯', title: 'Prompt 工程完整指南', category: 'Prompt工程',
    description: '系统学习 Prompt Engineering，从基础概念到高级技巧，掌握与 AI 高效沟通的方法论。',
    githubUrl: 'https://github.com/dair-ai/Prompt-Engineering-Guide',
    githubDesc: 'Prompt-Engineering-Guide — 最全面的 Prompt 工程教程，含论文、课程、代码示例',
    usageSteps: [
      '阅读指南中的 "Basics" 部分了解核心概念',
      '学习 Few-Shot、Chain-of-Thought、Tree-of-Thought 等高级技巧',
      '参考论文部分了解学术前沿',
      '在 Notebooks 中动手实践代码示例',
      '将学到的技巧应用到你的日常 AI 使用中',
    ],
    promptExample: `# Chain-of-Thought 示例
问题：一个商店买入60元商品，以80元卖出，利润是多少？
请逐步推理：
第1步：计算收入 = 80元
第2步：计算成本 = 60元
第3步：利润 = 收入 - 成本 = 80 - 60 = 20元
答案：利润是20元。`,
    tags: ['Prompt工程', '教程', '论文', '进阶'],
  },
  {
    id: 10, icon: '🏠', title: 'Stable Diffusion WebUI 本地部署', category: 'AI绘画',
    description: 'Automatic1111 的 WebUI 是使用最广泛的 SD 本地界面，支持插件生态和海量模型。',
    githubUrl: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
    githubDesc: 'stable-diffusion-webui — SD 最流行的本地 Web 界面，功能全面',
    usageSteps: [
      'git clone 仓库并运行 webui-user.bat 启动',
      '从 Civitai 下载 Checkpoint 模型放入 models/Stable-diffusion/',
      '安装 ControlNet 等插件增强出图控制力',
      '用 Prompt + 负面Prompt（Negative Prompt）控制出图',
      '调节 CFG Scale、Steps、Seed 等参数精细调整',
    ],
    promptExample: `Prompt: masterpiece, best quality, 1girl, sitting in cafe, reading book, afternoon sunlight, detailed background, soft lighting
Negative: low quality, bad anatomy, blurry, deformed, watermark`,
    tags: ['SD', 'WebUI', '本地部署', '开源'],
  },
  {
    id: 11, icon: '📊', title: 'Cursor AI 编程编辑器', category: 'AI编程',
    description: 'Cursor 是基于 VSCode 的 AI-first 编辑器，深度集成 AI 能力，支持代码生成、重构、调试。',
    githubUrl: 'https://github.com/getcursor/cursor',
    githubDesc: 'cursor — AI 编程编辑器，支持 Tab 补全、内联编辑、Chat 对话',
    usageSteps: [
      '从 cursor.com 下载安装（免费版可用）',
      'Cmd/Ctrl+K 打开内联编辑，用自然语言描述修改',
      'Cmd/Ctrl+L 打开 AI Chat，对话式编程',
      '选中代码 → Cmd/Ctrl+I 让 AI 在光标处编辑',
      '用 @file 引用项目文件作为 AI 上下文',
    ],
    promptExample: '在 Cursor 中选中组件代码 → Ctrl+K → "给这个 React 组件添加 loading 骨架屏和错误重试按钮"',
    tags: ['Cursor', 'IDE', 'VSCode', 'AI编程'],
  },
  {
    id: 12, icon: '🗣️', title: 'Open Interpreter 自然语言编程', category: 'AI编程',
    description: 'Open Interpreter 让你用自然语言控制电脑——运行代码、操作文件、浏览网页，真正的 AI Agent。',
    githubUrl: 'https://github.com/openinterpreter/open-interpreter',
    githubDesc: 'open-interpreter — 让 LLM 在本地运行代码，自然语言控制电脑',
    usageSteps: [
      'pip install open-interpreter',
      '终端运行 interpreter 进入对话',
      '用自然语言描述任务：如 "分析这个CSV文件并画图"',
      'AI 自动编写并执行 Python 代码完成任务',
      '在设置中开启/关闭代码执行确认，控制安全级别',
    ],
    promptExample: `interpreter
> 请读取 data.csv 文件，清洗缺失值，用 matplotlib 画出每列的分布直方图，保存为 analysis.png`,
    tags: ['Agent', '自然语言', '自动化', 'Python'],
  },
]);

const selectedTutorial = ref<Tutorial | null>(null);

function selectTutorial(t: Tutorial) {
  selectedTutorial.value = selectedTutorial.value?.id === t.id ? null : t;
}
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold mb-3">📖 AI 工具使用教程</h1>
      <p class="text-gray-500">精选 AI 工具和 GitHub 开源项目，每篇教程都包含安装步骤、使用方法、Prompt 示例</p>
    </div>

    <!-- 分类筛选 -->
    <div class="flex flex-wrap gap-2 mb-6">
      <el-tag v-for="cat in ['全部', 'AI对话', 'AI编程', 'AI绘画', '本地部署', 'AI开发框架', 'Prompt工程', 'AI搜索']" :key="cat" type="info" effect="plain" class="cursor-pointer hover:bg-primary-50">
        {{ cat }}
      </el-tag>
    </div>

    <!-- 教程列表 -->
    <div class="space-y-4">
      <div v-for="t in tutorials" :key="t.id" class="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition">
        <!-- 标题栏 -->
        <div @click="selectTutorial(t)" class="p-5 cursor-pointer flex items-start gap-4">
          <div class="text-3xl flex-shrink-0">{{ t.icon }}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-gray-800">{{ t.title }}</h3>
              <el-tag size="small" type="warning" effect="plain">{{ t.category }}</el-tag>
            </div>
            <p class="text-sm text-gray-500 leading-relaxed mb-2">{{ t.description }}</p>
            <div class="flex items-center gap-3 text-xs text-gray-400">
              <span class="flex items-center gap-1">🐙 <span class="text-primary-500 underline">{{ t.githubUrl.replace('https://github.com/', '') }}</span></span>
              <span class="text-primary-500 cursor-pointer">{{ selectedTutorial?.id === t.id ? '收起 ▲' : '展开教程 ▼' }}</span>
            </div>
            <div class="flex gap-1 mt-2">
              <el-tag v-for="tag in t.tags" :key="tag" size="small" type="info" effect="plain">{{ tag }}</el-tag>
            </div>
          </div>
        </div>

        <!-- 展开的教程内容 -->
        <div v-if="selectedTutorial?.id === t.id" class="border-t bg-gray-50 p-5 space-y-4">
          <!-- GitHub 项目说明 -->
          <div>
            <h4 class="font-semibold text-sm mb-2 flex items-center gap-2">🐙 GitHub 项目</h4>
            <a :href="t.githubUrl" target="_blank" class="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition">
              <span>{{ t.githubUrl }}</span>
              <span>↗</span>
            </a>
            <p class="text-sm text-gray-500 mt-2">{{ t.githubDesc }}</p>
          </div>

          <!-- 使用步骤 -->
          <div>
            <h4 class="font-semibold text-sm mb-2">📋 使用步骤</h4>
            <ol class="space-y-1">
              <li v-for="(step, i) in t.usageSteps" :key="i" class="text-sm text-gray-600 flex gap-2">
                <span class="text-primary-500 font-bold">{{ i + 1 }}.</span>
                <span>{{ step }}</span>
              </li>
            </ol>
          </div>

          <!-- Prompt 示例 -->
          <div>
            <h4 class="font-semibold text-sm mb-2">💬 Prompt 示例</h4>
            <pre class="bg-gray-900 text-green-400 p-4 rounded-lg text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto">{{ t.promptExample }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
