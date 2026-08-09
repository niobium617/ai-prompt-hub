import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const tags = await this.prisma.tag.findMany({
      orderBy: { useCount: 'desc' },
    });
    return tags.map(t => ({ ...t, id: Number(t.id) }));
  }

  async getHot(limit = 20) {
    const tags = await this.prisma.tag.findMany({
      orderBy: { useCount: 'desc' },
      take: limit,
    });
    return tags.map(t => ({ ...t, id: Number(t.id) }));
  }
}
