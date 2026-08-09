import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePromptDto, UpdatePromptDto, QueryPromptDto } from './dto/prompt.dto';

@Injectable()
export class PromptService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryPromptDto) {
    const { page = 1, pageSize = 12, categoryId, difficulty, status = 2, sort = 'newest', aiToolId } = query;
    const where: any = { status };

    if (categoryId) {
      // 查找分类及其子分类
      const children = await this.prisma.category.findMany({
        where: { parentId: categoryId },
        select: { id: true },
      });
      const ids = [categoryId, ...children.map(c => c.id)];
      where.categoryId = { in: ids };
    }
    if (difficulty) where.difficulty = difficulty;

    const orderBy: any = {};
    switch (sort) {
      case 'hot': orderBy.viewCount = 'desc'; break;
      case 'rating': orderBy.ratingAvg = 'desc'; break;
      default: orderBy.createdAt = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.prompt.findMany({
        where,
        skip: (+page - 1) * +pageSize,
        take: +pageSize,
        orderBy,
        include: { category: true, author: { select: { id: true, nickname: true, avatarUrl: true } } },
      }),
      this.prisma.prompt.count({ where }),
    ]);

    const mappedItems = items.map(p => ({
      ...p,
      id: Number(p.id),
      categoryId: Number(p.categoryId),
      author: { ...p.author, id: Number(p.author.id) },
      aiToolIds: p.aiToolIds ? JSON.parse(p.aiToolIds as string) : [],
      exampleImages: p.exampleImages ? JSON.parse(p.exampleImages as string) : [],
      ratingAvg: Number(p.ratingAvg),
    }));

    return { items: mappedItems, total, page: +page, pageSize: +pageSize, totalPages: Math.ceil(total / +pageSize) };
  }

  async findById(id: number) {
    const prompt = await this.prisma.prompt.findUnique({
      where: { id: BigInt(id) },
      include: { category: true, author: { select: { id: true, nickname: true, avatarUrl: true } } },
    });
    if (!prompt) throw new NotFoundException('提示词不存在');

    // 增加浏览量
    await this.prisma.prompt.update({ where: { id: BigInt(id) }, data: { viewCount: { increment: 1 } } });

    return {
      ...prompt,
      id: Number(prompt.id),
      categoryId: Number(prompt.categoryId),
      author: { ...prompt.author, id: Number(prompt.author.id) },
      aiToolIds: prompt.aiToolIds ? JSON.parse(prompt.aiToolIds as string) : [],
      exampleImages: prompt.exampleImages ? JSON.parse(prompt.exampleImages as string) : [],
      ratingAvg: Number(prompt.ratingAvg),
    };
  }

  async create(authorId: number, dto: CreatePromptDto) {
    const prompt = await this.prisma.prompt.create({
      data: {
        title: dto.title,
        description: dto.description,
        content: dto.content,
        categoryId: BigInt(dto.categoryId),
        authorId: BigInt(authorId),
        difficulty: dto.difficulty || 1,
        aiToolIds: JSON.stringify(dto.aiToolIds || []),
        exampleImages: JSON.stringify(dto.exampleImages || []),
        status: 0, // 草稿
      },
    });
    return { ...prompt, id: Number(prompt.id), categoryId: Number(prompt.categoryId) };
  }

  async update(id: number, userId: number, dto: UpdatePromptDto) {
    const prompt = await this.prisma.prompt.findUnique({ where: { id: BigInt(id) } });
    if (!prompt) throw new NotFoundException('提示词不存在');

    const data: any = { ...dto };
    if (dto.aiToolIds) data.aiToolIds = JSON.stringify(dto.aiToolIds);
    if (dto.exampleImages) data.exampleImages = JSON.stringify(dto.exampleImages);
    delete data.categoryId; delete data.authorId;

    const updated = await this.prisma.prompt.update({ where: { id: BigInt(id) }, data });
    return { ...updated, id: Number(updated.id), categoryId: Number(updated.categoryId) };
  }

  async getHot(limit = 10) {
    const items = await this.prisma.prompt.findMany({
      where: { status: 2 },
      orderBy: { viewCount: 'desc' },
      take: limit,
      include: { category: true },
    });
    return items.map(p => ({ ...p, id: Number(p.id), categoryId: Number(p.categoryId) }));
  }

  async getFeatured(limit = 10) {
    const items = await this.prisma.prompt.findMany({
      where: { status: 2, isFeatured: 1 },
      orderBy: { sortOrder: 'asc' },
      take: limit,
      include: { category: true },
    });
    return items.map(p => ({ ...p, id: Number(p.id), categoryId: Number(p.categoryId) }));
  }

  async recordCopy(id: number) {
    await this.prisma.prompt.update({ where: { id: BigInt(id) }, data: { useCount: { increment: 1 } } });
    return { success: true };
  }
}
