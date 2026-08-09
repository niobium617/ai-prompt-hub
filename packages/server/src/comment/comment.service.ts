import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async findByTarget(targetType: string, targetId: number, page = 1, pageSize = 20) {
    const where = { targetType, targetId: targetId, parentId: null, status: 1 };
    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip: (+page - 1) * +pageSize,
        take: +pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, nickname: true, avatarUrl: true } },
          replies: {
            where: { status: 1 },
            orderBy: { createdAt: 'asc' },
            include: { user: { select: { id: true, nickname: true, avatarUrl: true } } },
          },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);
    return {
      items: items.map(c => ({
        ...c,
        id: Number(c.id),
        userId: Number(c.userId),
        user: { ...c.user, id: Number(c.user.id) },
        replies: c.replies.map(r => ({ ...r, id: Number(r.id), userId: Number(r.userId), user: { ...r.user, id: Number(r.user.id) } })),
      })),
      total, page, pageSize,
    };
  }

  async create(userId: number, dto: CreateCommentDto) {
    const comment = await this.prisma.comment.create({
      data: { userId: userId, targetType: dto.targetType, targetId: dto.targetId, parentId: dto.parentId ? dto.parentId : null, content: dto.content },
      include: { user: { select: { id: true, nickname: true, avatarUrl: true } } },
    });
    return { ...comment, id: Number(comment.id), userId: Number(comment.userId), user: { ...comment.user, id: Number(comment.user.id) } };
  }

  async like(commentId: number) {
    await this.prisma.comment.update({ where: { id: commentId }, data: { likeCount: { increment: 1 } } });
    return { success: true };
  }
}
