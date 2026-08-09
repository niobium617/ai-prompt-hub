import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoryService } from './category.service';

@ApiTags('分类')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: '获取分类树' })
  getTree() {
    return this.categoryService.getTree();
  }

  @Get(':id/prompts')
  @ApiOperation({ summary: '获取分类下提示词' })
  getPrompts(@Param('id') id: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.categoryService.getPromptsByCategory(+id, page, pageSize);
  }
}
