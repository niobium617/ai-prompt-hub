import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  private checkAdmin(role: string) {
    if (role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('无管理权限');
    }
  }

  /**
   * 管理员删除提示词并通知作者
   */
  async deletePrompt(promptId: number, userRole: string, reason?: string) {
    this.checkAdmin(userRole);
    const prompt = await this.prisma.prompt.findUnique({ where: { id: promptId } });
    if (!prompt) throw new NotFoundException('提示词不存在');

    // 删除关联数据 + 提示词
    await this.prisma.$transaction([
      this.prisma.rating.deleteMany({ where: { promptId } }),
      this.prisma.promptTag.deleteMany({ where: { promptId } }),
      this.prisma.favorite.deleteMany({ where: { targetType: 'prompt', targetId: promptId } }),
      this.prisma.comment.deleteMany({ where: { targetType: 'prompt', targetId: promptId } }),
      this.prisma.prompt.delete({ where: { id: promptId } }),
    ]);

    // 通知作者
    await this.notificationService.create(
      prompt.authorId,
      'delete',
      '你的提示词已被删除',
      `《${prompt.title}》因${reason || '违反平台规范'}已被管理员删除。如有疑问请联系管理员。`,
    );

    return { success: true };
  }

  async getPendingPrompts(page = 1, pageSize = 20, userRole: string) {
    this.checkAdmin(userRole);
    const where = { status: 1 };
    const [items, total] = await Promise.all([
      this.prisma.prompt.findMany({ where, skip: ((Number(page) || 1) - 1) * (Number(pageSize) || 12), take: (Number(pageSize) || 12), orderBy: { createdAt: 'desc' }, include: { category: true, author: { select: { id: true, nickname: true } } } }),
      this.prisma.prompt.count({ where }),
    ]);
    return { items: items.map(p => ({ ...p, id: Number(p.id), categoryId: Number(p.categoryId) })), total, page, pageSize };
  }

  async approvePrompt(promptId: number, userRole: string) {
    this.checkAdmin(userRole);
    await this.prisma.prompt.update({ where: { id: promptId }, data: { status: 2, publishedAt: new Date() } });
    return { success: true };
  }

  async rejectPrompt(promptId: number, userRole: string) {
    this.checkAdmin(userRole);
    await this.prisma.prompt.update({ where: { id: promptId }, data: { status: 3 } });
    return { success: true };
  }

  async stats(userRole: string) {
    this.checkAdmin(userRole);
    const [promptCount, userCount, articleCount] = await Promise.all([
      this.prisma.prompt.count(), this.prisma.user.count(), this.prisma.article.count(),
    ]);
    return { promptCount, userCount, articleCount };
  }

  /**
   * 已发布提示词列表（含作者用户名）
   */
  async getPublishedPrompts(page = 1, pageSize = 20, userRole: string) {
    this.checkAdmin(userRole);
    const where = { status: 2 };
    const [items, total] = await Promise.all([
      this.prisma.prompt.findMany({
        where,
        skip: ((Number(page) || 1) - 1) * (Number(pageSize) || 20),
        take: (Number(pageSize) || 20),
        orderBy: { createdAt: 'desc' },
        include: { category: true, author: { select: { id: true, nickname: true, username: true } } },
      }),
      this.prisma.prompt.count({ where }),
    ]);
    return {
      items: items.map(p => ({ ...p, id: Number(p.id), categoryId: Number(p.categoryId), author: { ...p.author, id: Number(p.author.id) } })),
      total, page, pageSize,
    };
  }

  /**
   * 已发布文章列表
   */
  async getPublishedArticles(page = 1, pageSize = 20, userRole: string) {
    this.checkAdmin(userRole);
    const where = { status: 1 };
    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip: ((Number(page) || 1) - 1) * (Number(pageSize) || 20),
        take: (Number(pageSize) || 20),
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, nickname: true, username: true } } },
      }),
      this.prisma.article.count({ where }),
    ]);
    return {
      items: items.map(a => ({ ...a, id: Number(a.id), author: { ...a.author, id: Number(a.author.id) } })),
      total, page, pageSize,
    };
  }

  /**
   * 管理员删除文章并通知作者
   */
  async deleteArticle(articleId: number, userRole: string, reason?: string) {
    this.checkAdmin(userRole);
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('文章不存在');

    await this.prisma.$transaction([
      this.prisma.comment.deleteMany({ where: { targetType: 'article', targetId: articleId } }),
      this.prisma.favorite.deleteMany({ where: { targetType: 'article', targetId: articleId } }),
      this.prisma.article.delete({ where: { id: articleId } }),
    ]);

    await this.notificationService.create(
      article.authorId,
      'delete',
      '你的文章已被删除',
      `《${article.title}》因${reason || '违反平台规范'}已被管理员删除。如有疑问请联系管理员。`,
    );

    return { success: true };
  }
}
