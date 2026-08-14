import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromptService } from './prompt.service';
import { CreatePromptDto, UpdatePromptDto, QueryPromptDto } from './dto/prompt.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('提示词')
@Controller('prompts')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Get()
  @ApiOperation({ summary: '提示词列表' })
  findAll(@Query() query: QueryPromptDto) {
    return this.promptService.findAll(query);
  }

  @Get('hot')
  @ApiOperation({ summary: '热门提示词' })
  getHot(@Query('limit') limit?: number) {
    return this.promptService.getHot(limit);
  }

  @Get('featured')
  @ApiOperation({ summary: '精选推荐' })
  getFeatured(@Query('limit') limit?: number) {
    return this.promptService.getFeatured(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '提示词详情' })
  findById(@Param('id') id: string) {
    return this.promptService.findById(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '提交提示词' })
  create(@Request() req: any, @Body() dto: CreatePromptDto) {
    return this.promptService.create(req.user.id, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '编辑提示词' })
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdatePromptDto) {
    return this.promptService.update(+id, req.user.id, dto);
  }

  @Post(':id/copy')
  @ApiOperation({ summary: '记录使用次数' })
  recordCopy(@Param('id') id: string) {
    return this.promptService.recordCopy(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除提示词（作者或管理员）' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.promptService.remove(+id, req.user.id, req.user.role);
  }
}
