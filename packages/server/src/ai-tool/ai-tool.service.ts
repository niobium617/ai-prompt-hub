import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { LlmService, LlmMessage } from '../common/llm/llm.service';

@Injectable()
export class AiToolService {
  constructor(
    private prisma: PrismaService,
    private llm: LlmService,
  ) {}

  async findAll() {
    const tools = await this.prisma.aITool.findMany({
      where: { status: 1 },
      orderBy: { sortOrder: 'asc' },
    });
    return tools.map(t => ({ ...t, id: Number(t.id) }));
  }

  async generatePrompt(params: {
    category: string;
    description: string;
    toolName: string;
    style?: string;
  }) {
    const { category, description, toolName, style = 'professional' } = params;

    const systemPrompt = `你是一位专业的 Prompt 工程师，擅长为 ${toolName} 编写高质量的提示词。
用户将描述他们的需求，你需要生成一个优化的 Prompt。
生成的 Prompt 应包含：角色设定、任务描述、输出格式要求、约束条件。
${style === 'concise' ? '请生成简洁精炼的 Prompt。' : style === 'detailed' ? '请生成详细完整的 Prompt。' : '请生成专业规范的 Prompt。'}`;

    const userPrompt = `场景分类：${category}
目标AI工具：${toolName}
需求描述：${description}

请生成一个高质量的 Prompt。`;

    const messages: LlmMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const generated = await this.llm.chat(messages, { temperature: 0.8, maxTokens: 1500 });

    // 也生成一个简短版本
    const shortPrompt = await this.llm.chat([
      { role: 'system', content: systemPrompt + '\n请生成一个极简版本，控制在3-5句话内。' },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.8, maxTokens: 500 });

    return {
      prompt: generated,
      versions: [
        { label: '标准版', content: generated },
        { label: '精简版', content: shortPrompt },
      ],
      meta: {
        category,
        toolName,
        style,
        model: this.llm.isConfigured() ? 'AI 生成' : 'Mock 模板',
        generatedAt: new Date().toISOString(),
      },
    };
  }

  async optimizePrompt(params: {
    originalPrompt: string;
    style?: string;
    targetTool?: string;
  }) {
    const { originalPrompt, style = 'professional', targetTool = '通用AI' } = params;

    const systemPrompt = `你是一位 Prompt 优化专家。请优化用户提供的原始 Prompt。

优化维度：
1. 结构清晰性：添加角色设定、分段说明
2. 指令明确性：使用精确的动词和约束条件
3. 上下文完整性：补充必要的背景信息
4. 输出格式：指定期望的输出格式（Markdown/JSON/表格等）

${style === 'concise' ? '请尽量保持简洁。' : style === 'detailed' ? '请添加详细的约束和示例。' : '请保持专业平衡。'}
目标工具：${targetTool}`;

    const messages: LlmMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `请优化以下 Prompt：\n\n${originalPrompt}\n\n请输出优化后的完整 Prompt，并简要说明做了哪些改进。` },
    ];

    const optimized = await this.llm.chat(messages, { temperature: 0.6, maxTokens: 2000 });

    return {
      original: originalPrompt,
      optimized,
      style,
      meta: {
        targetTool,
        model: this.llm.isConfigured() ? 'AI 生成' : 'Mock 模板',
        generatedAt: new Date().toISOString(),
      },
    };
  }
}
