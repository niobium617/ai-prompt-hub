import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AiToolService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const tools = await this.prisma.aITool.findMany({
      where: { status: 1 },
      orderBy: { sortOrder: 'asc' },
    });
    return tools.map(t => ({ ...t, id: Number(t.id) }));
  }

  async generatePrompt(category: string, description: string, toolName: string) {
    // 简化版：根据场景和描述返回模板化的Prompt
    const templates: Record<string, string> = {
      '写作创作': `你是一位专业的${toolName}写作助手。请根据以下描述创作内容：\n\n${description}\n\n要求：内容结构清晰、语言流畅、符合预期风格。`,
      '编程开发': `你是一位资深${toolName}开发专家。请根据以下需求编写代码：\n\n${description}\n\n要求：代码规范、注释清晰、考虑边界情况。`,
      '设计创意': `你是一位${toolName}创意设计专家。请根据以下需求提供设计方案：\n\n${description}\n\n要求：创意独特、细节完善、可实现性强。`,
      '营销推广': `你是一位${toolName}营销专家。请根据以下需求撰写营销文案：\n\n${description}\n\n要求：吸引眼球、转化率高、符合平台调性。`,
      '数据分析': `你是一位${toolName}数据分析专家。请根据以下需求提供分析方案：\n\n${description}\n\n要求：方法科学、逻辑清晰、结论可落地。`,
      '教育学习': `你是一位${toolName}教育专家。请根据以下需求提供学习内容：\n\n${description}\n\n要求：循序渐进、通俗易懂、注重实用。`,
    };

    const prompt = templates[category] || `请根据以下需求生成内容：\n\n${description}`;
    return {
      prompt,
      versions: [prompt],
      meta: { category, toolName, generatedAt: new Date().toISOString() },
    };
  }

  async optimizePrompt(originalPrompt: string, style: string = 'professional') {
    // 简化版优化器
    const optimized = `[优化版本 - ${style}风格]\n\n${originalPrompt}\n\n---\n优化要点：\n1. 结构化表达，增加角色设定\n2. 明确输出格式要求\n3. 添加约束条件和示例\n4. 使用更精准的指令措辞`;
    return { original: originalPrompt, optimized, style };
  }
}
