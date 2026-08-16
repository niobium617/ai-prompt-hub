import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getSecret } from '../common/config/secrets';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getSecret('JWT_ACCESS_SECRET'),
    });
  }

  /**
   * 每次请求查库校验：账号被禁用立即失效，角色变更即时生效
   */
  async validate(payload: { sub: number }) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: { id: true, role: true, status: true },
    });
    if (!user || user.status === 0) {
      throw new UnauthorizedException('账号不存在或已被禁用');
    }
    return { id: user.id, role: user.role };
  }
}
