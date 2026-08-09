import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TagService } from './tag.service';

@ApiTags('标签')
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiOperation({ summary: '获取所有标签' })
  findAll() {
    return this.tagService.findAll();
  }

  @Get('hot')
  @ApiOperation({ summary: '热门标签' })
  getHot(@Query('limit') limit?: number) {
    return this.tagService.getHot(limit);
  }
}
