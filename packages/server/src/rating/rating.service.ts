import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) {}

  async rate(userId: number, promptId: number, score: number) {
    await this.prisma.rating.upsert({
      where: { userId_promptId: { userId: userId, promptId: promptId } },
      update: { score },
      create: { userId: userId, promptId: promptId, score },
    });

    // 更新提示词平均评分
    const agg = await this.prisma.rating.aggregate({
      where: { promptId: promptId },
      _avg: { score: true },
      _count: { score: true },
    });
    await this.prisma.prompt.update({
      where: { id: promptId },
      data: { ratingAvg: agg._avg.score || 0, ratingCount: agg._count.score },
    });

    return { success: true };
  }
}
