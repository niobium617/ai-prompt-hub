import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: number, page = 1, pageSize = 20) {
    const where = { userId: userId };
    const [items, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where,
        skip: (+page - 1) * +pageSize,
        take: +pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.favorite.count({ where }),
    ]);
    return { items: items.map(f => ({ ...f, id: Number(f.id), userId: Number(f.userId) })), total, page, pageSize };
  }

  async add(userId: number, targetType: string, targetId: number) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_targetType_targetId: { userId: userId, targetType, targetId: targetId } },
    });
    if (existing) throw new ConflictException('已收藏');

    const fav = await this.prisma.favorite.create({
      data: { userId: userId, targetType, targetId: targetId },
    });

    // 同步更新收藏数
    if (targetType === 'prompt') {
      await this.prisma.prompt.update({ where: { id: targetId }, data: { favoriteCount: { increment: 1 } } });
    }
    return { ...fav, id: Number(fav.id), userId: Number(fav.userId) };
  }

  async remove(userId: number, targetType: string, targetId: number) {
    await this.prisma.favorite.delete({
      where: { userId_targetType_targetId: { userId: userId, targetType, targetId: targetId } },
    });
    if (targetType === 'prompt') {
      await this.prisma.prompt.update({ where: { id: targetId }, data: { favoriteCount: { decrement: 1 } } });
    }
    return { success: true };
  }
}
