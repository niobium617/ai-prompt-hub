import { Controller, Get, Post, Delete, Query, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('收藏')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('user/favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  @ApiOperation({ summary: '我的收藏列表' })
  findByUser(@Request() req, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.favoriteService.findByUser(req.user.id, page, pageSize);
  }

  @Post()
  @ApiOperation({ summary: '添加收藏' })
  add(@Request() req, @Body() body: { targetType: string; targetId: number }) {
    return this.favoriteService.add(req.user.id, body.targetType, body.targetId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '取消收藏' })
  remove(@Request() req, @Param('id') id: string) {
    return this.favoriteService.remove(req.user.id, 'prompt', +id);
  }
}
