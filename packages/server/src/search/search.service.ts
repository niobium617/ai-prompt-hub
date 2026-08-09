import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(keyword: string, page = 1, pageSize = 12) {
    const p = Number(page) || 1 || 1;
    const ps = Number(pageSize) || 12 || 12;
    const skip = (p - 1) * ps;
    const take = ps;
    const where = {
      status: 2,
      OR: [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
        { content: { contains: keyword } },
      ],
    };

    const [items, total] = await Promise.all([
      this.prisma.prompt.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' } as any,
        include: { category: true, author: { select: { id: true, nickname: true, avatarUrl: true } } },
      }),
      this.prisma.prompt.count({ where }),
    ]);

    return {
      items: items.map(p => ({
        ...p, id: Number(p.id), categoryId: Number(p.categoryId),
        author: { ...p.author, id: Number(p.author.id) },
      })),
      total, page, pageSize,
    };
  }

  async suggestions(keyword: string, limit = 10) {
    const prompts = await this.prisma.prompt.findMany({
      where: { status: 2, title: { contains: keyword } },
      select: { id: true, title: true },
      take: limit,
    });
    return prompts.map(p => ({ id: Number(p.id), title: p.title }));
  }
}
