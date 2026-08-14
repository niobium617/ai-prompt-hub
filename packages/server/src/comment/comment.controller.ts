import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DevWriteGuard } from '../common/dev-mode/dev-write.guard';

@ApiTags('评论')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiOperation({ summary: '评论列表' })
  findByTarget(@Query('targetType') targetType: string, @Query('targetId') targetId: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.commentService.findByTarget(targetType, +targetId, page, pageSize);
  }

  @Post()
  @UseGuards(JwtAuthGuard, DevWriteGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发表评论' })
  create(@Request() req: any, @Body() dto: CreateCommentDto) {
    return this.commentService.create(req.user.id, dto);
  }

  @Post(':id/like')
  @ApiOperation({ summary: '点赞评论' })
  like(@Param('id') id: string) {
    return this.commentService.like(+id);
  }
}
