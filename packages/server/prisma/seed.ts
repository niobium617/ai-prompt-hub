import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始种子数据初始化...');

  // ==================== 分类 ====================
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        id: 1, name: '写作创作', icon: 'edit', sortOrder: 1,
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
    }),
    prisma.category.create({
      data: {
        id: 2, name: '编程开发', icon: 'code', sortOrder: 2,
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
    }),
    prisma.category.create({
      data: {
        id: 3, name: '设计创意', icon: 'palette', sortOrder: 3,
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
    }),
    prisma.category.create({
      data: {
        id: 4, name: '营销推广', icon: 'campaign', sortOrder: 4,
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
    }),
    prisma.category.create({
      data: {
        id: 5, name: '数据分析', icon: 'insights', sortOrder: 5,
        children: {
          create: [
            { name: 'Excel公式', sortOrder: 1 },
            { name: 'SQL查询', sortOrder: 2 },
            { name: '数据解读', sortOrder: 3 },
            { name: '可视化建议', sortOrder: 4 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        id: 6, name: '教育学习', icon: 'school', sortOrder: 6,
        children: {
          create: [
            { name: '语言学习', sortOrder: 1 },
            { name: '知识问答', sortOrder: 2 },
            { name: '作业辅导', sortOrder: 3 },
            { name: '考试备考', sortOrder: 4 },
          ],
        },
      },
    }),
  ]);
  console.log(`✅ 创建了 ${categories.length} 个一级分类及其子分类`);

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
  await prisma.user.create({
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

  // ==================== 示例提示词 ====================
  const samplePrompts = [
    {
      title: '小红书爆款文案生成器',
      description: '专为小红书平台优化的文案生成Prompt，可生成多种风格的种草笔记',
      content: '你是一位资深小红书博主，擅长创作爆款笔记。请根据以下信息生成一篇小红书文案：\n\n产品/主题：{{product}}\n风格：{{style}}\n字数要求：{{word_count}}\n\n要求：\n1. 标题吸引眼球，使用emoji\n2. 正文分段落，易于阅读\n3. 使用"姐妹们"等社区化语言\n4. 结尾加上相关话题标签',
      categoryId: 4,
      difficulty: 1,
      status: 2,
      isFeatured: 1,
      viewCount: 1520,
      favoriteCount: 328,
      useCount: 890,
      ratingAvg: 4.8,
      ratingCount: 156,
      aiToolIds: [1, 2, 4],
    },
    {
      title: 'TypeScript代码审查助手',
      description: '帮助你审查TypeScript代码，发现潜在问题并给出改进建议',
      content: '你是一位资深TypeScript开发专家。请审查以下代码，从以下维度给出分析：\n\n1. 类型安全性\n2. 代码可读性\n3. 性能优化建议\n4. 最佳实践\n\n代码：\n```typescript\n{{code}}\n```\n\n请以结构化方式输出审查报告。',
      categoryId: 2,
      difficulty: 2,
      status: 2,
      isFeatured: 1,
      viewCount: 980,
      favoriteCount: 215,
      useCount: 520,
      ratingAvg: 4.6,
      ratingCount: 89,
      aiToolIds: [1, 2, 10],
    },
    {
      title: 'Midjourney 写实人物肖像',
      description: '生成高质量写实风格人物肖像的 Midjourney Prompt 模板',
      content: 'Portrait of {{subject}}, {{age}} {{gender}}, {{ethnicity}}, {{expression}} expression, {{lighting}} lighting, shot on {{camera}}, 85mm lens, f/1.8, shallow depth of field, hyperrealistic, 8k, professional photography --ar {{aspect_ratio}} --style raw --v 6.0',
      categoryId: 3,
      difficulty: 2,
      status: 2,
      viewCount: 2100,
      favoriteCount: 456,
      useCount: 1340,
      ratingAvg: 4.9,
      ratingCount: 230,
      aiToolIds: [7],
    },
    {
      title: '学术论文翻译润色',
      description: '将中文论文翻译为学术英文，并进行润色优化',
      content: 'You are a professional academic translator and editor. Please translate the following Chinese academic text into English, then polish it to meet top-tier journal standards.\n\nRequirements:\n1. Use formal academic language\n2. Maintain technical accuracy\n3. Improve sentence flow and clarity\n4. Add transition phrases where appropriate\n\nChinese text:\n{{chinese_text}}\n\nPlease output:\n1. Direct translation\n2. Polished version\n3. Summary of key changes made',
      categoryId: 1,
      difficulty: 3,
      status: 2,
      viewCount: 680,
      favoriteCount: 142,
      useCount: 410,
      ratingAvg: 4.5,
      ratingCount: 67,
      aiToolIds: [1, 2, 4],
    },
    {
      title: 'SQL查询优化助手',
      description: '分析慢SQL查询，给出优化方案和改写建议',
      content: '你是一位数据库优化专家。请分析以下SQL查询，给出优化建议：\n\n数据库类型：{{db_type}}\n表结构：\n{{table_schema}}\n\n慢查询SQL：\n{{slow_query}}\n\n当前执行计划：\n{{explain_output}}\n\n请输出：\n1. 问题诊断（索引缺失/查询逻辑/数据量）\n2. 优化后的SQL\n3. 建议添加的索引\n4. 预期性能提升',
      categoryId: 5,
      difficulty: 2,
      status: 2,
      viewCount: 450,
      favoriteCount: 98,
      useCount: 260,
      ratingAvg: 4.7,
      ratingCount: 45,
      aiToolIds: [1, 2, 10],
    },
  ];

  // 获取admin用户作为作者
  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });

  for (let i = 0; i < samplePrompts.length; i++) {
    const prompt = samplePrompts[i];
    await prisma.prompt.create({
      data: {
        ...prompt,
        authorId: adminUser!.id,
        publishedAt: new Date(),
        aiToolIds: JSON.stringify(prompt.aiToolIds),
      },
    });
  }
  console.log(`✅ 创建了 ${samplePrompts.length} 条示例提示词`);

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
