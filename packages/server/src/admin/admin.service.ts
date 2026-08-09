import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private checkAdmin(role: string) {
    if (role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('无管理权限');
    }
  }

  async getPendingPrompts(page = 1, pageSize = 20, userRole: string) {
    this.checkAdmin(userRole);
    const where = { status: 1 };
    const [items, total] = await Promise.all([
      this.prisma.prompt.findMany({ where, skip: (+page - 1) * +pageSize, take: +pageSize, orderBy: { createdAt: 'desc' }, include: { category: true, author: { select: { id: true, nickname: true } } } }),
      this.prisma.prompt.count({ where }),
    ]);
    return { items: items.map(p => ({ ...p, id: Number(p.id), categoryId: Number(p.categoryId) })), total, page, pageSize };
  }

  async approvePrompt(promptId: number, userRole: string) {
    this.checkAdmin(userRole);
    await this.prisma.prompt.update({ where: { id: BigInt(promptId) }, data: { status: 2, publishedAt: new Date() } });
    return { success: true };
  }

  async rejectPrompt(promptId: number, userRole: string) {
    this.checkAdmin(userRole);
    await this.prisma.prompt.update({ where: { id: BigInt(promptId) }, data: { status: 3 } });
    return { success: true };
  }

  async stats(userRole: string) {
    this.checkAdmin(userRole);
    const [promptCount, userCount, articleCount] = await Promise.all([
      this.prisma.prompt.count(), this.prisma.user.count(), this.prisma.article.count(),
    ]);
    return { promptCount, userCount, articleCount };
  }
}
