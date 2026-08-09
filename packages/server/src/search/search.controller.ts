import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('搜索')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: '搜索提示词' })
  search(@Query('keyword') keyword: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.searchService.search(keyword, page, pageSize);
  }

  @Get('suggestions')
  @ApiOperation({ summary: '搜索建议' })
  suggestions(@Query('keyword') keyword: string) {
    return this.searchService.suggestions(keyword);
  }
}
