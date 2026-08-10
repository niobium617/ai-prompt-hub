import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始种子数据初始化...');

  // ==================== 分类 ====================
  const cat1 = await prisma.category.create({
    data: {
      name: '写作创作', icon: 'edit', sortOrder: 1,
      children: {
        create: [
          { name: '文案写作', sortOrder: 1 },
          { name: '小说创作', sortOrder: 2 },
          { name: '邮件撰写', sortOrder: 3 },
          { name: '报告生成', sortOrder: 4 },
          { name: '翻译润色', sortOrder: 5 },
        ],
      },
    },
  });
  const cat2 = await prisma.category.create({
    data: {
      name: '编程开发', icon: 'code', sortOrder: 2,
      children: {
        create: [
          { name: '代码生成', sortOrder: 1 },
          { name: 'Bug修复', sortOrder: 2 },
          { name: '代码重构', sortOrder: 3 },
          { name: '文档生成', sortOrder: 4 },
          { name: '算法实现', sortOrder: 5 },
        ],
      },
    },
  });
  const cat3 = await prisma.category.create({
    data: {
      name: '设计创意', icon: 'palette', sortOrder: 3,
      children: {
        create: [
          { name: 'AI绘画', sortOrder: 1 },
          { name: 'Logo设计', sortOrder: 2 },
          { name: '海报设计', sortOrder: 3 },
          { name: 'UI设计', sortOrder: 4 },
          { name: '品牌策划', sortOrder: 5 },
        ],
      },
    },
  });
  const cat4 = await prisma.category.create({
    data: {
      name: '营销推广', icon: 'campaign', sortOrder: 4,
      children: {
        create: [
          { name: '广告语', sortOrder: 1 },
          { name: '小红书笔记', sortOrder: 2 },
          { name: '公众号文章', sortOrder: 3 },
          { name: '短视频脚本', sortOrder: 4 },
          { name: '电商详情页', sortOrder: 5 },
        ],
      },
    },
  });
  const cat5 = await prisma.category.create({
    data: {
      name: '数据分析', icon: 'insights', sortOrder: 5,
      children: {
        create: [
          { name: 'Excel公式', sortOrder: 1 },
          { name: 'SQL查询', sortOrder: 2 },
          { name: '数据解读', sortOrder: 3 },
          { name: '可视化建议', sortOrder: 4 },
        ],
      },
    },
  });
  const cat6 = await prisma.category.create({
    data: {
      name: '教育学习', icon: 'school', sortOrder: 6,
      children: {
        create: [
          { name: '语言学习', sortOrder: 1 },
          { name: '知识问答', sortOrder: 2 },
          { name: '作业辅导', sortOrder: 3 },
          { name: '考试备考', sortOrder: 4 },
        ],
      },
    },
  });
  console.log('✅ 创建了 6 个一级分类及子分类');

  // ==================== AI工具 ====================
  const tools = [
    { name: 'ChatGPT', category: 'text', description: 'OpenAI 开发的大语言模型', officialUrl: 'https://chat.openai.com', sortOrder: 1 },
    { name: 'Claude', category: 'text', description: 'Anthropic 开发的AI助手', officialUrl: 'https://claude.ai', sortOrder: 2 },
    { name: '豆包', category: 'text', description: '字节跳动AI对话助手', officialUrl: 'https://www.doubao.com', sortOrder: 3 },
    { name: 'Kimi', category: 'text', description: '月之暗面推出的智能助手', officialUrl: 'https://kimi.moonshot.cn', sortOrder: 4 },
    { name: '通义千问', category: 'text', description: '阿里云推出的AI助手', officialUrl: 'https://tongyi.aliyun.com', sortOrder: 5 },
    { name: '文心一言', category: 'text', description: '百度推出的AI助手', officialUrl: 'https://yiyan.baidu.com', sortOrder: 6 },
    { name: 'Midjourney', category: 'image', description: 'AI图像生成工具', officialUrl: 'https://www.midjourney.com', sortOrder: 7 },
    { name: 'Stable Diffusion', category: 'image', description: '开源AI图像生成模型', officialUrl: 'https://stability.ai', sortOrder: 8 },
    { name: 'DALL-E', category: 'image', description: 'OpenAI 图像生成模型', officialUrl: 'https://openai.com/dall-e-3', sortOrder: 9 },
    { name: 'GitHub Copilot', category: 'code', description: 'AI编程助手', officialUrl: 'https://github.com/features/copilot', sortOrder: 10 },
  ];
  for (const tool of tools) {
    await prisma.aITool.create({ data: tool });
  }
  console.log(`✅ 创建了 ${tools.length} 个AI工具`);

  // ==================== 标签 ====================
  const tagNames = ['高效', '创意', '实用', '热门', '新手友好', '进阶', '精选',
    'ChatGPT', 'Claude', 'Midjourney', '办公效率', '创意设计', '代码助手', '学习成长', '翻译'];
  for (const name of tagNames) {
    await prisma.tag.create({ data: { name } });
  }
  console.log(`✅ 创建了 ${tagNames.length} 个标签`);

  // ==================== 管理员账号 ====================
  const adminHash = await bcrypt.hash('REMOVED-SECRET', 12);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@prompt-hub.local',
      passwordHash: adminHash,
      nickname: '管理员',
      role: 'admin',
      level: 4,
      points: 2000,
    },
  });
  console.log('✅ 创建管理员账号: admin / REMOVED-SECRET');

  // ==================== 测试用户 ====================
  const userHash = await bcrypt.hash('REMOVED-SECRET', 12);
  await prisma.user.create({
    data: {
      username: 'testuser',
      email: 'test@prompt-hub.local',
      passwordHash: userHash,
      nickname: '测试用户',
      role: 'user',
    },
  });
  console.log('✅ 创建测试用户: testuser / REMOVED-SECRET');

  // ==================== 示例提示词 ====================
  const samplePrompts = [
    {
      title: '小红书爆款文案生成器',
      description: '专为小红书平台优化的文案生成Prompt，可生成多种风格的种草笔记',
      content: '你是一位资深小红书博主，擅长创作爆款笔记。请根据以下信息生成一篇小红书文案：\n\n产品/主题：{{product}}\n风格：{{style}}\n字数要求：{{word_count}}\n\n要求：\n1. 标题吸引眼球，使用emoji\n2. 正文分段落，易于阅读\n3. 使用"姐妹们"等社区化语言\n4. 结尾加上相关话题标签',
      categoryId: cat4.id,
      difficulty: 1,
      status: 2,
      isFeatured: 1,
      viewCount: 1520,
      favoriteCount: 328,
      useCount: 890,
      ratingAvg: 4.8,
      ratingCount: 156,
      aiToolIds: JSON.stringify([1, 2, 4]),
    },
    {
      title: 'TypeScript代码审查助手',
      description: '帮助你审查TypeScript代码，发现潜在问题并给出改进建议',
      content: '你是一位资深TypeScript开发专家。请审查以下代码，从以下维度给出分析：\n\n1. 类型安全性\n2. 代码可读性\n3. 性能优化建议\n4. 最佳实践\n\n代码：\n```typescript\n{{code}}\n```\n\n请以结构化方式输出审查报告。',
      categoryId: cat2.id,
      difficulty: 2,
      status: 2,
      isFeatured: 1,
      viewCount: 980,
      favoriteCount: 215,
      useCount: 520,
      ratingAvg: 4.6,
      ratingCount: 89,
      aiToolIds: JSON.stringify([1, 2, 10]),
    },
    {
      title: 'Midjourney 写实人物肖像',
      description: '生成高质量写实风格人物肖像的 Midjourney Prompt 模板',
      content: 'Portrait of {{subject}}, {{age}} {{gender}}, {{ethnicity}}, {{expression}} expression, {{lighting}} lighting, shot on {{camera}}, 85mm lens, f/1.8, shallow depth of field, hyperrealistic, 8k, professional photography --ar {{aspect_ratio}} --style raw --v 6.0',
      categoryId: cat3.id,
      difficulty: 2,
      status: 2,
      viewCount: 2100,
      favoriteCount: 456,
      useCount: 1340,
      ratingAvg: 4.9,
      ratingCount: 230,
      aiToolIds: JSON.stringify([7]),
    },
    {
      title: '学术论文翻译润色',
      description: '将中文论文翻译为学术英文，并进行润色优化',
      content: 'You are a professional academic translator and editor. Please translate the following Chinese academic text into English, then polish it to meet top-tier journal standards.\n\nRequirements:\n1. Use formal academic language\n2. Maintain technical accuracy\n3. Improve sentence flow and clarity\n4. Add transition phrases where appropriate\n\nChinese text:\n{{chinese_text}}\n\nPlease output:\n1. Direct translation\n2. Polished version\n3. Summary of key changes made',
      categoryId: cat1.id,
      difficulty: 3,
      status: 2,
      viewCount: 680,
      favoriteCount: 142,
      useCount: 410,
      ratingAvg: 4.5,
      ratingCount: 67,
      aiToolIds: JSON.stringify([1, 2, 4]),
    },
    {
      title: 'SQL查询优化助手',
      description: '分析慢SQL查询，给出优化方案和改写建议',
      content: '你是一位数据库优化专家。请分析以下SQL查询，给出优化建议：\n\n数据库类型：{{db_type}}\n表结构：\n{{table_schema}}\n\n慢查询SQL：\n{{slow_query}}\n\n当前执行计划：\n{{explain_output}}\n\n请输出：\n1. 问题诊断（索引缺失/查询逻辑/数据量）\n2. 优化后的SQL\n3. 建议添加的索引\n4. 预期性能提升',
      categoryId: cat5.id,
      difficulty: 2,
      status: 2,
      viewCount: 450,
      favoriteCount: 98,
      useCount: 260,
      ratingAvg: 4.7,
      ratingCount: 45,
      aiToolIds: JSON.stringify([1, 2, 10]),
    },
  ];

  // ==================== 更多示例提示词 ====================
  const morePrompts = [
    {
      title: 'React 组件代码生成器',
      description: '根据需求描述自动生成 TypeScript React 组件，包含 Props 接口定义',
      content: '你是一位资深React开发者。请根据以下需求创建组件：\n\n组件名：{{component_name}}\n功能：{{description}}\nProps：{{props_list}}\n\n要求：\n1. 使用 TypeScript + React Hooks\n2. 导出 Props 接口\n3. 包含 JSDoc 注释\n4. 遵循 React 最佳实践',
      categoryId: cat2.id, difficulty: 2, status: 2, viewCount: 830, favoriteCount: 196, useCount: 460, ratingAvg: 4.7, ratingCount: 78,
      aiToolIds: JSON.stringify([1,2,10]),
    },
    {
      title: '公众号文章写作助手',
      description: '专业的微信公众号文章创作Prompt，支持多种风格和排版要求',
      content: '你是一位微信公众号资深编辑。请撰写一篇关于 {{topic}} 的公众号文章。\n\n要求：\n1. 开头使用悬念/故事/数据吸引读者\n2. 正文使用短段落，每段不超过3行\n3. 适当使用小标题分隔\n4. 使用emoji和分隔线增加可读性\n5. 结尾引导读者互动（点赞/在看/留言）\n6. 字数：{{word_count}}字左右\n\n风格：{{style}}',
      categoryId: cat4.id, difficulty: 1, status: 2, viewCount: 620, favoriteCount: 143, useCount: 380, ratingAvg: 4.5, ratingCount: 52,
      aiToolIds: JSON.stringify([1,3,4]),
    },
    {
      title: '简历优化与职位匹配',
      description: '根据简历内容和目标职位，优化简历表达并匹配岗位需求',
      content: '你是一位资深HR和职业规划师。请分析以下简历并优化：\n\n原始简历：\n{{resume}}\n\n目标职位：{{target_job}}\n\n请输出：\n1. 简历综合评分（1-10分）\n2. 优势亮点分析\n3. 需要改进的地方\n4. 优化后的简历全文\n5. 与目标职位的匹配度分析\n6. 面试准备建议',
      categoryId: cat1.id, difficulty: 2, status: 2, viewCount: 1200, favoriteCount: 289, useCount: 720, ratingAvg: 4.8, ratingCount: 112,
      aiToolIds: JSON.stringify([1,2]),
    },
    {
      title: 'AI Logo 设计师',
      description: '为品牌设计 Logo 的 Midjourney / DALL-E Prompt',
      content: 'You are a professional logo designer. Create a logo design prompt for:\n\nBrand Name: {{brand_name}}\nIndustry: {{industry}}\nStyle: {{style}} (minimalist/modern/vintage/tech)\nColor Preference: {{colors}}\n\nRequirements:\n1. Simple and memorable\n2. Scalable (works at any size)\n3. Appropriate for the industry\n4. Include symbol/icon + text layout description',
      categoryId: cat3.id, difficulty: 1, status: 2, viewCount: 560, favoriteCount: 167, useCount: 340, ratingAvg: 4.4, ratingCount: 41,
      aiToolIds: JSON.stringify([7,9]),
    },
    {
      title: 'API 接口文档生成器',
      description: '根据代码自动生成 RESTful API 接口文档',
      content: '你是一位API文档工程师。请为以下接口代码生成文档：\n\n代码：\n```\n{{code}}\n```\n\n请生成 Markdown 格式文档，包含：\n1. 接口路径和方法\n2. 请求参数（Query/Body/Header）\n3. 响应格式（成功+错误示例）\n4. 认证方式\n5. 调用示例（curl + JavaScript）',
      categoryId: cat2.id, difficulty: 2, status: 2, viewCount: 480, favoriteCount: 105, useCount: 290, ratingAvg: 4.6, ratingCount: 38,
      aiToolIds: JSON.stringify([1,2,10]),
    },
    {
      title: '电商产品详情页文案',
      description: '生成淘宝/京东/拼多多产品详情页文案，突出卖点促进转化',
      content: '你是一位顶级电商文案策划。请为以下产品撰写详情页文案：\n\n产品：{{product_name}}\n价格：{{price}}\n核心卖点：{{selling_points}}\n目标人群：{{target_audience}}\n\n要求：\n1. 主标题吸引点击\n2. 核心卖点图文并茂的描述\n3. 使用场景展示\n4. 规格参数清晰\n5. 售后保障说明\n6. 限时优惠引导下单',
      categoryId: cat4.id, difficulty: 2, status: 2, viewCount: 750, favoriteCount: 201, useCount: 510, ratingAvg: 4.7, ratingCount: 65,
      aiToolIds: JSON.stringify([1,3,4]),
    },
    {
      title: '英语口语陪练',
      description: '作为AI英语口语教练，进行场景化对话练习并纠正语法发音',
      content: 'You are an English speaking coach. Please have a conversation with me about {{topic}}.\n\nRules:\n1. Keep the conversation natural and engaging\n2. Correct my grammar mistakes gently\n3. Suggest better vocabulary when appropriate\n4. Keep your responses at {{level}} level (beginner/intermediate/advanced)\n5. After each 5 exchanges, give me a brief progress summary',
      categoryId: cat6.id, difficulty: 1, status: 2, viewCount: 380, favoriteCount: 92, useCount: 210, ratingAvg: 4.3, ratingCount: 28,
      aiToolIds: JSON.stringify([1,2]),
    },
    {
      title: 'Docker Compose 配置生成',
      description: '根据服务需求自动生成 Docker Compose 配置文件和部署说明',
      content: '你是一位DevOps工程师。请为以下服务生成 Docker Compose 配置：\n\n服务列表：{{services}}\n数据库：{{database}}\n缓存：{{cache}}\n需要网络隔离：{{network_isolation}}\n\n要求：\n1. 使用 Docker Compose v3.8 语法\n2. 配置健康检查\n3. 数据持久化（volumes）\n4. 网络配置\n5. 环境变量管理\n6. 附带启动说明',
      categoryId: cat2.id, difficulty: 3, status: 2, viewCount: 540, favoriteCount: 178, useCount: 350, ratingAvg: 4.8, ratingCount: 55,
      aiToolIds: JSON.stringify([1,2,10]),
    },
    {
      title: '短视频脚本创作',
      description: '抖音/快手/B站短视频脚本生成，包含分镜、台词、时长规划',
      content: '你是一位短视频编导。请为以下主题创作脚本：\n\n主题：{{topic}}\n平台：{{platform}}（抖音/快手/B站）\n时长：{{duration}}秒\n风格：{{style}}\n\n格式：\n| 时间 | 画面描述 | 台词/配音 | BGM/音效 |\n|------|---------|----------|--------|\n\n要求：前3秒抓住注意力，中间有反转/高潮，结尾引导互动',
      categoryId: cat4.id, difficulty: 2, status: 2, viewCount: 920, favoriteCount: 234, useCount: 580, ratingAvg: 4.6, ratingCount: 87,
      aiToolIds: JSON.stringify([1,3]),
    },
    {
      title: 'Excel 公式生成器',
      description: '用自然语言描述需求，自动生成 Excel 公式和操作步骤',
      content: '你是一位Excel专家。请根据以下需求生成公式：\n\n表格结构：\n{{table_structure}}\n\n需求：{{requirement}}\n\nExcel版本：{{excel_version}}\n\n请输出：\n1. 使用的公式（含解释）\n2. 操作步骤\n3. 可能的变体方案\n4. 注意事项',
      categoryId: cat5.id, difficulty: 1, status: 2, viewCount: 650, favoriteCount: 156, useCount: 420, ratingAvg: 4.5, ratingCount: 49,
      aiToolIds: JSON.stringify([1,2,4]),
    },
    {
      title: '雅思写作 Task 2 高分模板',
      description: '针对雅思大作文的 Prompt，提供结构化的写作框架和范文指导',
      content: 'You are an IELTS examiner. Help me write a Task 2 essay on:\n\nTopic: {{topic}}\nWord count: 250-300\n\nStructure:\n1. Introduction: paraphrase the question + state your position\n2. Body Paragraph 1: first main argument + example\n3. Body Paragraph 2: second main argument + example\n4. Body Paragraph 3 (optional): counter-argument + rebuttal\n5. Conclusion: summarize + restate position\n\nPlease also suggest advanced vocabulary and complex sentence structures.',
      categoryId: cat6.id, difficulty: 2, status: 2, viewCount: 480, favoriteCount: 134, useCount: 310, ratingAvg: 4.4, ratingCount: 36,
      aiToolIds: JSON.stringify([1,2]),
    },
    {
      title: 'UI 设计需求转化为开发文档',
      description: '将UI设计稿描述转换为前端开发任务清单和组件规划',
      content: '你是一位前端架构师。请将以下UI设计转化为开发文档：\n\n页面描述：{{page_description}}\n技术栈：{{tech_stack}}\n已有组件库：{{component_lib}}\n\n请输出：\n1. 页面组件树结构\n2. 状态管理设计\n3. 数据流向\n4. 响应式方案\n5. 需要新建的组件列表（含Props定义）\n6. 开发工作量估算',
      categoryId: cat2.id, difficulty: 3, status: 2, viewCount: 410, favoriteCount: 98, useCount: 240, ratingAvg: 4.7, ratingCount: 32,
      aiToolIds: JSON.stringify([2,10]),
    },
  ];

  // 合并所有
  const allPrompts = [...samplePrompts, ...morePrompts];
  for (const p of allPrompts) {
    await prisma.prompt.create({
      data: {
        ...p,
        authorId: admin.id,
        publishedAt: new Date(),
      },
    });
  }
  console.log(`✅ 创建了 ${allPrompts.length} 条示例提示词`);

  console.log('\n🎉 种子数据初始化完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
