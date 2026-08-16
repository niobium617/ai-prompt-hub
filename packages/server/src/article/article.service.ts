import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateArticleDto } from './dto/article.dto';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, pageSize = 12) {
    const where = { status: 1 };
    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip: ((Number(page) || 1) - 1) * (Number(pageSize) || 12),
        take: (Number(pageSize) || 12),
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, nickname: true, avatarUrl: true } } },
      }),
      this.prisma.article.count({ where }),
    ]);
    return {
      items: items.map(a => ({ ...a, id: Number(a.id), author: { ...a.author, id: Number(a.author.id) } })),
      total, page, pageSize,
    };
  }

  async findById(id: number, viewer?: { id: number; role: string } | null) {
    const article = await this.prisma.article.findUnique({
      where: { id: id },
      include: { author: { select: { id: true, nickname: true, avatarUrl: true } } },
    });
    if (!article) throw new NotFoundException('文章不存在');

    // 非公开状态仅作者本人或管理员可见（404 防存在性探测）
    if (article.status !== 1) {
      const isOwner = viewer && Number(viewer.id) === article.authorId;
      const isAdmin = viewer && ['admin', 'super_admin'].includes(viewer.role);
      if (!isOwner && !isAdmin) throw new NotFoundException('文章不存在');
    }

    // 浏览量（仅公开内容）
    if (article.status === 1) {
      await this.prisma.article.update({ where: { id: id }, data: { viewCount: { increment: 1 } } });
    }
    return { ...article, id: Number(article.id), author: { ...article.author, id: Number(article.author.id) } };
  }

  async create(authorId: number, dto: CreateArticleDto) {
    const article = await this.prisma.article.create({
      data: {
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        authorId: authorId,
        categoryId: dto.categoryId ? dto.categoryId : null,
        tagIds: JSON.stringify(dto.tagIds || []),
        chapterStructure: dto.chapterStructure ? JSON.stringify(dto.chapterStructure) : null,
        status: 0, // 新发布一律进入待审核队列（publishedAt 由审核通过时写入）
      },
    });
    return { ...article, id: Number(article.id) };
  }

  /**
   * 删除文章（作者本人或管理员）
   */
  async remove(id: number, userId: number, userRole: string) {
    const article = await this.prisma.article.findUnique({ where: { id: id } });
    if (!article) throw new NotFoundException('文章不存在');
    if (article.authorId !== userId && userRole !== 'admin' && userRole !== 'super_admin') {
      throw new ForbiddenException('无权删除他人内容');
    }
    await this.prisma.$transaction([
      this.prisma.comment.deleteMany({ where: { targetType: 'article', targetId: id } }),
      this.prisma.favorite.deleteMany({ where: { targetType: 'article', targetId: id } }),
      this.prisma.article.delete({ where: { id: id } }),
    ]);
    return { success: true };
  }
}
