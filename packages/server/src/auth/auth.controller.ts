import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, SendCodeDto, LoginByCodeDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { MailService } from '../common/mail/mail.service';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: '邮箱注册' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: '邮箱/用户名登录' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: '刷新Token' })
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('send-code')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: '发送邮箱验证码' })
  async sendCode(@Body() dto: SendCodeDto) {
    try {
      const result = await this.mailService.sendCode(dto.email, dto.purpose || 'login');
      return { success: true, ...result };
    } catch (e: any) {
      throw new BadRequestException(e.message || '发送失败');
    }
  }

  @Post('login/code')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: '邮箱验证码登录（未注册自动创建账号）' })
  async loginByCode(@Body() dto: LoginByCodeDto) {
    if (!this.mailService.verifyCode(dto.email, dto.code, 'login')) {
      throw new BadRequestException('验证码错误或已过期');
    }
    return this.authService.loginByCode(dto.email);
  }

  @Post('login/wechat')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: '微信小程序登录（新用户需绑定邮箱）' })
  wechatLogin(@Body() body: { code: string }) {
    return this.authService.wechatLogin(body.code);
  }

  @Post('wechat/bind')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: '微信绑定邮箱（已注册邮箱需验证码）' })
  wechatBind(@Body() body: { bindToken: string; email: string; code?: string }) {
    return this.authService.wechatBind(body.bindToken, body.email, body.code);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码（需邮箱验证码，邮箱须与当前账号一致）' })
  changePassword(
    @Request() req: any,
    @Body() dto: ChangePasswordDto,
  ) {
    if (!this.mailService.verifyCode(dto.email, dto.code, 'change-password')) {
      throw new BadRequestException('验证码错误或已过期');
    }
    return this.authService.changePassword(req.user.id, dto.email, dto.newPassword);
  }
}
