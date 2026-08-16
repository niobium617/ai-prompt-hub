import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DraftService {
  constructor(private prisma: PrismaService) {}

  /**
   * 基于公共提示词创建私有草稿（复制原文，不改动公共数据）
   * 同一用户对同一来源重复创建时，返回已有草稿（幂等）
   */
  async createFromPrompt(userId: number, sourcePromptId: number, userRole?: string) {
    const source = await this.prisma.prompt.findUnique({ where: { id: sourcePromptId } });
    if (!source) throw new NotFoundException('来源提示词不存在');
    // 仅已发布内容或本人/管理员的内容可派生草稿
    if (source.status !== 2 && source.authorId !== userId && userRole !== 'admin' && userRole !== 'super_admin') {
      throw new ForbiddenException('该内容未发布，无法派生草稿');
    }

    // 已有基于该来源的草稿 → 直接返回，不重复创建
    const existing = await this.prisma.promptDraft.findFirst({
      where: { userId, sourcePromptId },
      orderBy: { updatedAt: 'desc' },
    });
    if (existing) {
      return {
        ...existing,
        id: Number(existing.id),
        userId: Number(existing.userId),
        sourcePromptId: Number(existing.sourcePromptId),
        reused: true,
      };
    }

    const draft = await this.prisma.promptDraft.create({
      data: {
        userId,
        sourcePromptId,
        title: source.title + '（我的草稿）',
        description: source.description,
        content: source.content,
        aiToolIds: source.aiToolIds,
        difficulty: source.difficulty,
      },
    });
    return { ...draft, id: Number(draft.id), userId: Number(draft.userId), sourcePromptId: Number(draft.sourcePromptId), reused: false };
  }

  /**
   * 我的草稿列表
   */
  async findByUser(userId: number, page = 1, pageSize = 20) {
    const p = Number(page) || 1;
    const ps = Number(pageSize) || 20;
    const where = { userId };
    const [items, total] = await Promise.all([
      this.prisma.promptDraft.findMany({
        where,
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.promptDraft.count({ where }),
    ]);
    return {
      items: items.map(d => ({
        ...d,
        id: Number(d.id),
        userId: Number(d.userId),
        sourcePromptId: Number(d.sourcePromptId),
      })),
      total, page: p, pageSize: ps,
    };
  }

  /**
   * 草稿详情 + 来源原文（用于对照）
   */
  async findById(userId: number, draftId: number) {
    const draft = await this.prisma.promptDraft.findUnique({ where: { id: draftId } });
    if (!draft) throw new NotFoundException('草稿不存在');
    if (draft.userId !== userId) throw new ForbiddenException('无权访问该草稿');

    const source = await this.prisma.prompt.findUnique({
      where: { id: draft.sourcePromptId },
      include: { category: true },
    });

    return {
      draft: {
        ...draft,
        id: Number(draft.id),
        userId: Number(draft.userId),
        sourcePromptId: Number(draft.sourcePromptId),
      },
      source: source ? { ...source, id: Number(source.id), categoryId: Number(source.categoryId) } : null,
    };
  }

  /**
   * 保存草稿修改
   */
  async update(userId: number, draftId: number, data: {
    title?: string; description?: string; content?: string; difficulty?: number; aiToolIds?: number[];
  }) {
    const draft = await this.prisma.promptDraft.findUnique({ where: { id: draftId } });
    if (!draft) throw new NotFoundException('草稿不存在');
    if (draft.userId !== userId) throw new ForbiddenException('无权修改该草稿');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
    if (data.aiToolIds !== undefined) updateData.aiToolIds = JSON.stringify(data.aiToolIds);

    const updated = await this.prisma.promptDraft.update({ where: { id: draftId }, data: updateData });
    return { ...updated, id: Number(updated.id), userId: Number(updated.userId), sourcePromptId: Number(updated.sourcePromptId) };
  }

  /**
   * 删除草稿
   */
  async remove(userId: number, draftId: number) {
    const draft = await this.prisma.promptDraft.findUnique({ where: { id: draftId } });
    if (!draft) throw new NotFoundException('草稿不存在');
    if (draft.userId !== userId) throw new ForbiddenException('无权删除该草稿');
    await this.prisma.promptDraft.delete({ where: { id: draftId } });
    return { success: true };
  }
}
