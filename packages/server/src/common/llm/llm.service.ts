import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get('LLM_API_KEY') || '';
    this.baseUrl = this.config.get('LLM_API_BASE_URL') || 'https://api.openai.com/v1';
    this.defaultModel = this.config.get('LLM_MODEL') || 'gpt-3.5-turbo';
  }

  async chat(messages: LlmMessage[], options?: LlmOptions): Promise<string> {
    const model = options?.model || this.defaultModel;

    // 未配置 API Key 时使用 Mock 模式
    if (!this.apiKey || this.apiKey === 'your-api-key') {
      return this.mockChat(messages);
    }

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2000,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        this.logger.error(`LLM API error: ${res.status} ${err}`);
        return this.mockChat(messages);
      }

      const data = await res.json() as any;
      return data.choices?.[0]?.message?.content || '';
    } catch (e: any) {
      this.logger.error(`LLM call failed: ${e.message}`);
      return this.mockChat(messages);
    }
  }

  /**
   * Mock 模式：未配置 API Key 时返回模板化回复
   */
  private mockChat(messages: LlmMessage[]): string {
    const userMsg = messages.find(m => m.role === 'user')?.content || '';
    const systemMsg = messages.find(m => m.role === 'system')?.content || '';

    // Prompt 生成器 mock
    if (systemMsg.includes('生成') || userMsg.includes('生成')) {
      return this.mockGenerate(userMsg);
    }
    // Prompt 优化器 mock
    if (systemMsg.includes('优化') || userMsg.includes('优化')) {
      return this.mockOptimize(userMsg);
    }
    // 通用 mock
    return `[Mock模式] 基于你的需求，生成以下内容：\n\n${userMsg}\n\n---\n💡 提示：配置 LLM_API_KEY 环境变量即可启用真实 AI 生成。`;
  }

  private mockGenerate(userMsg: string): string {
    return `你是一位专业的AI助手。请根据以下需求完成任务：

${userMsg}

要求：
1. 内容结构清晰，分段落输出
2. 语言专业但易懂
3. 包含具体可操作的步骤
4. 如有需要，提供示例说明

请开始。`;
  }

  private mockOptimize(userMsg: string): string {
    return `[优化版]

**角色设定**：你是一位专业领域的资深专家。

**任务描述**：
${userMsg}

**输出要求**：
1. 结构化分点输出
2. 使用专业术语但保持易懂
3. 提供具体示例
4. 总结关键要点

**格式要求**：使用 Markdown 格式，包含标题、列表和代码块（如适用）。

---
💡 提示：配置 LLM_API_KEY 后，优化器会调用真实 AI 进行深度优化。`;
  }

  /**
   * 检查是否已配置真实 API
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your-api-key';
  }
}
