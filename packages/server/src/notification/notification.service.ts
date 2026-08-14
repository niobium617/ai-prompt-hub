import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建通知
   */
  async create(userId: number, type: string, title: string, content: string) {
    return this.prisma.notification.create({
      data: { userId, type, title, content },
    });
  }

  /**
   * 获取用户通知列表
   */
  async findByUser(userId: number, page = 1, pageSize = 20) {
    const p = Number(page) || 1;
    const ps = Number(pageSize) || 20;
    const where = { userId };
    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: 0 } }),
    ]);
    return {
      items: items.map(n => ({ ...n, id: Number(n.id), userId: Number(n.userId) })),
      total,
      unreadCount,
      page: p,
      pageSize: ps,
    };
  }

  /**
   * 标记已读
   */
  async markRead(userId: number, id?: number) {
    if (id) {
      await this.prisma.notification.updateMany({
        where: { id: Number(id), userId },
        data: { isRead: 1 },
      });
    } else {
      await this.prisma.notification.updateMany({
        where: { userId, isRead: 0 },
        data: { isRead: 1 },
      });
    }
    return { success: true };
  }
}
