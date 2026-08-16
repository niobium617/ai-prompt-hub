import { Injectable, UnauthorizedException, ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma/prisma.service';
import { MailService } from '../common/mail/mail.service';
import { getSecret } from '../common/config/secrets';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  /** 开发模式白名单（测试账号） */
  private readonly DEV_ALLOWED_EMAILS = ['admin@prompt-hub.local', 'test@prompt-hub.local'];

  /** 开发模式是否允许该账号 */
  private checkDevMode(email: string) {
    if (process.env.DEV_MODE !== 'true') return;
    if (!this.DEV_ALLOWED_EMAILS.includes(email)) {
      throw new UnauthorizedException('开发模式：仅限测试账号登录');
    }
  }

  async register(dto: RegisterDto) {
    this.checkDevMode(dto.email);
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });
    if (existing) {
      // 统一文案，避免账号枚举
      throw new UnauthorizedException('注册失败，请稍后重试');
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
    // 开发模式：仅白名单邮箱可登录
    this.checkDevMode(user.email);

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('账号或密码错误');
    }

    return this.generateTokens(user.id, user.role);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: getSecret('JWT_REFRESH_SECRET'),
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
    this.checkDevMode(email);
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

  async changePassword(userId: number, email: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email !== email) {
      throw new ForbiddenException('邮箱与当前账号不匹配');
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { success: true };
  }

  /**
   * 微信小程序登录
   * 流程：code → openid → 已有用户直接登录；新用户返回 bindToken 要求绑定邮箱
   */
  async wechatLogin(code: string) {
    const openid = await this.exchangeOpenid(code);

    const user = await this.prisma.user.findUnique({ where: { wechatOpenid: openid } });
    if (user) {
      if (user.status === 0) throw new UnauthorizedException('账号已被禁用');
      return { ...this.generateTokens(user.id, user.role), needBindEmail: false };
    }

    // 新用户：签发一次性绑定 token（5分钟有效）
    const bindToken = this.jwtService.sign(
      { openid, purpose: 'wechat-bind' },
      { expiresIn: '5m' },
    );
    return { needBindEmail: true, bindToken };
  }

  /**
   * 微信绑定邮箱
   * - 邮箱未注册：直接创建新账号
   * - 邮箱已注册：需验证码验证身份后绑定到已有账号
   */
  async wechatBind(bindToken: string, email: string, code?: string) {
    // 开发模式：仅白名单邮箱可绑定/创建（与登录一致）
    this.checkDevMode(email);
    let payload: any;
    try {
      payload = this.jwtService.verify(bindToken);
    } catch {
      throw new UnauthorizedException('绑定凭证无效或已过期，请重新登录');
    }
    if (payload.purpose !== 'wechat-bind' || !payload.openid) {
      throw new UnauthorizedException('绑定凭证无效');
    }

    // openid 已被绑定过 → 直接登录
    const openidUser = await this.prisma.user.findUnique({ where: { wechatOpenid: payload.openid } });
    if (openidUser) {
      return { ...this.generateTokens(openidUser.id, openidUser.role), needBindEmail: false };
    }

    // 邮箱已注册：验证身份后绑定
    const emailUser = await this.prisma.user.findUnique({ where: { email } });
    if (emailUser) {
      if (!code) {
        // 第一步：发验证码
        const result = await this.mailService.sendCode(email, 'wechat-bind');
        return { needVerify: true, ...result };
      }
      // 第二步：验证码校验后绑定（用途绑定）
      if (!this.mailService.verifyCode(email, code, 'wechat-bind')) {
        throw new UnauthorizedException('验证码错误或已过期');
      }
      await this.prisma.user.update({
        where: { id: emailUser.id },
        data: { wechatOpenid: payload.openid },
      });
      return { ...this.generateTokens(emailUser.id, emailUser.role), needBindEmail: false };
    }

    // 新邮箱：直接创建账号
    const username = 'wx_' + Math.random().toString(36).slice(2, 8);
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        passwordHash: '',
        nickname: email.split('@')[0],
        wechatOpenid: payload.openid,
      },
    });
    return { ...this.generateTokens(user.id, user.role), needBindEmail: false };
  }

  /**
   * 用 code 换 openid（未配 AppSecret 时用开发模式模拟）
   */
  private async exchangeOpenid(code: string): Promise<string> {
    const appId = this.config.get('WECHAT_APP_ID');
    const secret = this.config.get('WECHAT_APP_SECRET');
    if (!appId || !secret || secret === 'REMOVED-SECRET') {
      // 仅本地开发模式允许 mock openid；生产未配置一律拒绝（防止伪造 openid 建号）
      if (process.env.DEV_MODE === 'true' && process.env.NODE_ENV !== 'production') {
        return 'dev_' + code.slice(0, 20);
      }
      throw new ServiceUnavailableException('微信登录未配置，请联系管理员');
    }
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    const res = await fetch(url);
    const data = await res.json() as any;
    if (!data.openid) {
      throw new UnauthorizedException('微信登录失败：' + (data.errmsg || '未知错误'));
    }
    return data.openid;
  }

  private generateTokens(userId: number, role: string) {
    const payload = { sub: Number(userId), role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: getSecret('JWT_REFRESH_SECRET'),
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    };
  }
}
