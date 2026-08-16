import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 可选 JWT 守卫：带 token 则解析用户，不带则放行为匿名访问（req.user 为 null）
 * 用于详情页等「公开可见，但作者/管理员有额外权限」的场景
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    return user ?? null;
  }
}
