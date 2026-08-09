import { Injectable, NotFoundException } from '@nestjs/common';
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
        skip: (+page - 1) * +pageSize,
        take: +pageSize,
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

  async findById(id: number) {
    const article = await this.prisma.article.findUnique({
      where: { id: id },
      include: { author: { select: { id: true, nickname: true, avatarUrl: true } } },
    });
    if (!article) throw new NotFoundException('文章不存在');
    await this.prisma.article.update({ where: { id: id }, data: { viewCount: { increment: 1 } } });
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
        status: 1,
        publishedAt: new Date(),
      },
    });
    return { ...article, id: Number(article.id) };
  }
}
