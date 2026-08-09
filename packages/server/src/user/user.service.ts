import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true, username: true, email: true, nickname: true,
        avatarUrl: true, bio: true, level: true, points: true,
        role: true, createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return { ...user, id: Number(user.id) };
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: id },
      data: {
        ...(dto.nickname && { nickname: dto.nickname }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.avatarUrl && { avatarUrl: dto.avatarUrl }),
      },
      select: {
        id: true, username: true, email: true, nickname: true,
        avatarUrl: true, bio: true, level: true, points: true,
        role: true, createdAt: true,
      },
    });
    return { ...user, id: Number(user.id) };
  }

  async getMyPrompts(userId: number, page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      this.prisma.prompt.findMany({
        where: { authorId: userId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      this.prisma.prompt.count({ where: { authorId: userId } }),
    ]);
    return { items: items.map(p => ({ ...p, id: Number(p.id), categoryId: Number(p.categoryId) })), total, page, pageSize };
  }
}
