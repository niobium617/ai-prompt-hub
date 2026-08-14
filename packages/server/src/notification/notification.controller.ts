import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('通知')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('user/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '通知列表' })
  findByUser(@Request() req: any, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.notificationService.findByUser(req.user.id, page, pageSize);
  }

  @Post('read')
  @ApiOperation({ summary: '标记已读（不传id则全部已读）' })
  markRead(@Request() req: any, @Param('id') id?: string) {
    return this.notificationService.markRead(req.user.id, id ? Number(id) : undefined);
  }

  @Post('read/:id')
  @ApiOperation({ summary: '标记单条已读' })
  markReadOne(@Request() req: any, @Param('id') id: string) {
    return this.notificationService.markRead(req.user.id, Number(id));
  }
}
