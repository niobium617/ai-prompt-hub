import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });
    if (existing) {
      throw new UnauthorizedException('邮箱或用户名已存在');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        passwordHash,
        nickname: dto.nickname || dto.username,
      },
    });

    return this.generateTokens(user.id, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email || '' }, { username: dto.username || '' }],
      },
    });
    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }
    if (user.status === 0) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('账号或密码错误');
    }

    return this.generateTokens(user.id, user.role);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-placeholder',
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.status === 0) {
        throw new UnauthorizedException('用户不存在或已禁用');
      }
      return this.generateTokens(user.id, user.role);
    } catch {
      throw new UnauthorizedException('Token无效或已过期');
    }
  }

  async loginByCode(email: string) {
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // 未注册用户自动创建
      const username = 'user_' + email.split('@')[0] + Math.floor(Math.random() * 10000);
      user = await this.prisma.user.create({
        data: {
          username,
          email,
          passwordHash: '', // 验证码登录用户初始无密码
          nickname: email.split('@')[0],
        },
      });
    }
    if (user.status === 0) {
      throw new UnauthorizedException('账号已被禁用');
    }
    return this.generateTokens(user.id, user.role);
  }

  async changePassword(userId: number, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { success: true };
  }

  private generateTokens(userId: number, role: string) {
    const payload = { sub: Number(userId), role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-placeholder',
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    };
  }
}
