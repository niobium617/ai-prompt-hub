import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DraftService } from './draft.service';
import { CreateDraftDto, UpdateDraftDto } from './dto/draft.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DevWriteGuard } from '../common/dev-mode/dev-write.guard';

@ApiTags('草稿')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('drafts')
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  @Post()
  @UseGuards(DevWriteGuard)
  @ApiOperation({ summary: '基于公共提示词创建私有草稿' })
  create(@Request() req: any, @Body() dto: CreateDraftDto) {
    return this.draftService.createFromPrompt(req.user.id, dto.sourcePromptId, req.user.role);
  }

  @Get()
  @ApiOperation({ summary: '我的草稿列表' })
  findByUser(@Request() req: any, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.draftService.findByUser(req.user.id, page, pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: '草稿详情 + 来源原文' })
  findById(@Param('id') id: string, @Request() req: any) {
    return this.draftService.findById(req.user.id, +id);
  }

  @Put(':id')
  @UseGuards(DevWriteGuard)
  @ApiOperation({ summary: '保存草稿' })
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateDraftDto) {
    return this.draftService.update(req.user.id, +id, dto);
  }

  @Delete(':id')
  @UseGuards(DevWriteGuard)
  @ApiOperation({ summary: '删除草稿' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.draftService.remove(req.user.id, +id);
  }
}
