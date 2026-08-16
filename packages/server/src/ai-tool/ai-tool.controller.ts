import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AiToolService } from './ai-tool.service';

@ApiTags('AI工具')
@Controller('tools')
export class AiToolController {
  constructor(private readonly aiToolService: AiToolService) {}

  @Get()
  @ApiOperation({ summary: '获取AI工具列表' })
  findAll() {
    return this.aiToolService.findAll();
  }

  @Post('prompt-generator')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Prompt生成器' })
  generate(@Body() body: {
    category: string;
    description: string;
    toolName: string;
    style?: string;
  }) {
    return this.aiToolService.generatePrompt(body);
  }

  @Post('prompt-optimizer')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Prompt优化器' })
  optimize(@Body() body: {
    originalPrompt: string;
    style?: string;
    targetTool?: string;
  }) {
    return this.aiToolService.optimizePrompt(body);
  }
}
