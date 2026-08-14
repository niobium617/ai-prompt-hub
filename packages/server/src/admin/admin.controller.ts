import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('管理后台')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('prompts/pending')
  @ApiOperation({ summary: '待审核提示词列表' })
  getPending(@Request() req: any, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.adminService.getPendingPrompts(page, pageSize, req.user.role);
  }

  @Post('prompts/:id/approve')
  @ApiOperation({ summary: '审核通过' })
  approve(@Param('id') id: string, @Request() req: any) {
    return this.adminService.approvePrompt(+id, req.user.role);
  }

  @Post('prompts/:id/reject')
  @ApiOperation({ summary: '审核驳回' })
  reject(@Param('id') id: string, @Request() req: any) {
    return this.adminService.rejectPrompt(+id, req.user.role);
  }

  @Get('stats')
  @ApiOperation({ summary: '数据统计' })
  stats(@Request() req: any) {
    return this.adminService.stats(req.user.role);
  }

  @Delete('prompts/:id')
  @ApiOperation({ summary: '删除提示词并通知作者' })
  deletePrompt(@Param('id') id: string, @Request() req: any, @Body('reason') reason?: string) {
    return this.adminService.deletePrompt(+id, req.user.role, reason);
  }

  @Get('prompts/published')
  @ApiOperation({ summary: '已发布提示词列表' })
  getPublishedPrompts(@Request() req: any, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.adminService.getPublishedPrompts(page, pageSize, req.user.role);
  }

  @Get('articles/published')
  @ApiOperation({ summary: '已发布文章列表' })
  getPublishedArticles(@Request() req: any, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.adminService.getPublishedArticles(page, pageSize, req.user.role);
  }

  @Delete('articles/:id')
  @ApiOperation({ summary: '删除文章并通知作者' })
  deleteArticle(@Param('id') id: string, @Request() req: any, @Body('reason') reason?: string) {
    return this.adminService.deleteArticle(+id, req.user.role, reason);
  }
}
