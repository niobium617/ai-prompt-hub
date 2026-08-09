import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('文章')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @ApiOperation({ summary: '文章列表' })
  findAll(@Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.articleService.findAll(page, pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: '文章详情' })
  findById(@Param('id') id: string) {
    return this.articleService.findById(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建文章' })
  create(@Request() req, @Body() dto: CreateArticleDto) {
    return this.articleService.create(req.user.id, dto);
  }
}
