import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * 开发模式写操作守卫
 * DEV_MODE=true 时，仅允许测试账号（id 1、2）或管理员执行写操作
 */
@Injectable()
export class DevWriteGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (process.env.DEV_MODE !== 'true') {
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) {
      throw new ForbiddenException('开发模式：请先登录');
    }
    const allowed = user.role === 'admin' || user.role === 'super_admin' || [1, 2].includes(user.id);
    if (!allowed) {
      throw new ForbiddenException('开发模式：仅限测试账号操作');
    }
    return true;
  }
}
