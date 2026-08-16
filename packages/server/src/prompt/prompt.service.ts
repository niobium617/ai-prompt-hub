import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePromptDto, UpdatePromptDto, QueryPromptDto } from './dto/prompt.dto';

@Injectable()
export class PromptService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryPromptDto) {
    const { page = 1, pageSize = 12, categoryId, difficulty, sort = 'newest', aiToolId } = query;
    // 公开列表固定只显示已发布内容（待审/草稿不可被外部查询）
    const where: any = { status: 2 };

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
        skip: ((Number(page) || 1) - 1) * (Number(pageSize) || 12),
        take: (Number(pageSize) || 12),
        orderBy,
        include: { category: true, author: { select: { id: true, nickname: true, avatarUrl: true, username: true } } },
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

    return { items: mappedItems, total, page: Number(page) || 1, pageSize: Number(pageSize) || 12, totalPages: Math.ceil(total / Number(pageSize) || 12) };
  }

  async findById(id: number, viewer?: { id: number; role: string } | null) {
    const prompt = await this.prisma.prompt.findUnique({
      where: { id: id },
      include: { category: true, author: { select: { id: true, nickname: true, avatarUrl: true, username: true } } },
    });
    if (!prompt) throw new NotFoundException('提示词不存在');

    // 非公开状态仅作者本人或管理员可见（404 防存在性探测）
    if (prompt.status !== 2) {
      const isOwner = viewer && Number(viewer.id) === prompt.authorId;
      const isAdmin = viewer && ['admin', 'super_admin'].includes(viewer.role);
      if (!isOwner && !isAdmin) throw new NotFoundException('提示词不存在');
    }

    // 增加浏览量（仅公开内容）
    if (prompt.status === 2) {
      await this.prisma.prompt.update({ where: { id: id }, data: { viewCount: { increment: 1 } } });
    }

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
        categoryId: dto.categoryId,
        authorId: authorId,
        difficulty: dto.difficulty || 1,
        aiToolIds: JSON.stringify(dto.aiToolIds || []),
        exampleImages: JSON.stringify(dto.exampleImages || []),
        status: 1, // 新发布一律进入待审核队列
      },
    });
    return { ...prompt, id: Number(prompt.id), categoryId: Number(prompt.categoryId) };
  }

  async update(id: number, userId: number, userRole: string, dto: UpdatePromptDto) {
    const prompt = await this.prisma.prompt.findUnique({ where: { id: id } });
    if (!prompt) throw new NotFoundException('提示词不存在');
    // 仅作者本人或管理员可编辑
    if (prompt.authorId !== userId && userRole !== 'admin' && userRole !== 'super_admin') {
      throw new ForbiddenException('无权编辑他人内容');
    }

    const data: any = { ...dto };
    if (dto.aiToolIds) data.aiToolIds = JSON.stringify(dto.aiToolIds);
    if (dto.exampleImages) data.exampleImages = JSON.stringify(dto.exampleImages);
    // 状态只能由审核流程修改，防御性剥离
    delete data.categoryId; delete data.authorId; delete data.status;

    const updated = await this.prisma.prompt.update({ where: { id: id }, data });
    return { ...updated, id: Number(updated.id), categoryId: Number(updated.categoryId) };
  }

  async getHot(limit = 10) {
    const n = Math.floor(+limit || 10);
    const items = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT p.*, c.id as cat_id, c.name as cat_name FROM prompts p LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = 2 ORDER BY p.view_count DESC LIMIT ${n}`
    );
    return items.map((p: any) => this.mapPrompt(p));
  }

  async getFeatured(limit = 10) {
    const n = Math.floor(+limit || 10);
    const items = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT p.*, c.id as cat_id, c.name as cat_name FROM prompts p LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = 2 AND p.is_featured = 1 ORDER BY p.sort_order ASC LIMIT ${n}`
    );
    return items.map((p: any) => this.mapPrompt(p));
  }

  async recordCopy(id: number) {
    await this.prisma.prompt.update({ where: { id: id }, data: { useCount: { increment: 1 } } });
    return { success: true };
  }

  /**
   * 删除提示词（作者本人或管理员）
   */
  async remove(id: number, userId: number, userRole: string) {
    const prompt = await this.prisma.prompt.findUnique({ where: { id: id } });
    if (!prompt) throw new NotFoundException('提示词不存在');
    if (prompt.authorId !== userId && userRole !== 'admin' && userRole !== 'super_admin') {
      throw new ForbiddenException('无权删除他人内容');
    }
    // 级联删除关联数据
    await this.prisma.$transaction([
      this.prisma.rating.deleteMany({ where: { promptId: id } }),
      this.prisma.promptTag.deleteMany({ where: { promptId: id } }),
      this.prisma.favorite.deleteMany({ where: { targetType: 'prompt', targetId: id } }),
      this.prisma.comment.deleteMany({ where: { targetType: 'prompt', targetId: id } }),
      this.prisma.prompt.delete({ where: { id: id } }),
    ]);
    return { success: true };
  }

  private mapPrompt(p: any) {
    return {
      id: Number(p.id), title: p.title, description: p.description,
      content: p.content, categoryId: Number(p.category_id), authorId: Number(p.author_id),
      aiToolIds: p.ai_tool_ids ? JSON.parse(p.ai_tool_ids) : [],
      difficulty: p.difficulty, exampleImages: p.example_images ? JSON.parse(p.example_images) : [],
      status: p.status, viewCount: p.view_count, useCount: p.use_count,
      favoriteCount: p.favorite_count, ratingAvg: p.rating_avg, ratingCount: p.rating_count,
      isFeatured: p.is_featured, sortOrder: p.sort_order,
      createdAt: p.created_at, updatedAt: p.updated_at, publishedAt: p.published_at,
      category: { id: Number(p.cat_id), name: p.cat_name },
    };
  }
}
