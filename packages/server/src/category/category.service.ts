import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getTree() {
    const categories = await this.prisma.category.findMany({
      where: { status: 1 },
      orderBy: { sortOrder: 'asc' },
    });
    return this.buildTree(categories.map(c => ({ ...c, id: Number(c.id), parentId: c.parentId ? Number(c.parentId) : null })));
  }

  private buildTree(items: any[]) {
    const map = new Map<number, any>();
    const roots: any[] = [];
    for (const item of items) {
      map.set(item.id, { ...item, children: [] });
    }
    for (const item of items) {
      const node = map.get(item.id);
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  async getPromptsByCategory(categoryId: number, page = 1, pageSize = 12) {
    // 获取子分类ID
    const children = await this.prisma.category.findMany({ where: { parentId: categoryId }, select: { id: true } });
    const ids = [categoryId, ...children.map(c => c.id)];

    const [items, total] = await Promise.all([
      this.prisma.prompt.findMany({
        where: { categoryId: { in: ids }, status: 2 },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      this.prisma.prompt.count({ where: { categoryId: { in: ids }, status: 2 } }),
    ]);
    return { items: items.map(p => ({ ...p, id: Number(p.id), categoryId: Number(p.categoryId) })), total, page, pageSize };
  }
}
