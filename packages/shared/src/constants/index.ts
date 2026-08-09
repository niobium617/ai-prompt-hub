// ==================== 一级分类 ====================
export const MAIN_CATEGORIES = [
  { name: '写作创作', icon: 'edit', children: ['文案写作', '小说创作', '邮件撰写', '报告生成', '翻译润色'] },
  { name: '编程开发', icon: 'code', children: ['代码生成', 'Bug修复', '代码重构', '文档生成', '算法实现'] },
  { name: '设计创意', icon: 'palette', children: ['AI绘画', 'Logo设计', '海报设计', 'UI设计', '品牌策划'] },
  { name: '营销推广', icon: 'campaign', children: ['广告语', '小红书笔记', '公众号文章', '短视频脚本', '电商详情页'] },
  { name: '数据分析', icon: 'insights', children: ['Excel公式', 'SQL查询', '数据解读', '可视化建议'] },
  { name: '教育学习', icon: 'school', children: ['语言学习', '知识问答', '作业辅导', '考试备考'] },
] as const;

// ==================== AI工具列表 ====================
export const AI_TOOLS = [
  { name: 'ChatGPT', category: 'text' },
  { name: 'Claude', category: 'text' },
  { name: '豆包', category: 'text' },
  { name: 'Kimi', category: 'text' },
  { name: '通义千问', category: 'text' },
  { name: '文心一言', category: 'text' },
  { name: 'Midjourney', category: 'image' },
  { name: 'Stable Diffusion', category: 'image' },
  { name: 'DALL-E', category: 'image' },
  { name: 'GitHub Copilot', category: 'code' },
] as const;

// ==================== 错误码 ====================
export const ERROR_CODES = {
  SUCCESS: 0,
  BAD_REQUEST: 40000,
  UNAUTHORIZED: 40100,
  FORBIDDEN: 40300,
  NOT_FOUND: 40400,
  CONFLICT: 40900,
  RATE_LIMIT: 42900,
  INTERNAL_ERROR: 50000,
} as const;

// ==================== 等级规则 ====================
export const LEVEL_RULES = {
  1: { name: '新手', minPoints: 0, favoriteLimit: 50, canSubmit: false },
  2: { name: '进阶', minPoints: 100, favoriteLimit: 200, canSubmit: true },
  3: { name: '达人', minPoints: 500, favoriteLimit: Infinity, canSubmit: true, needFeatured: 10 },
  4: { name: '专家', minPoints: 2000, favoriteLimit: Infinity, canSubmit: true, needCertified: true },
} as const;
