import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
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
  @ApiOperation({ summary: '邮箱注册' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: '邮箱/用户名登录' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: '刷新Token' })
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('send-code')
  @ApiOperation({ summary: '发送邮箱验证码' })
  async sendCode(@Body() body: { email: string; purpose: 'change-password' | 'register' | 'login' }) {
    try {
      const result = await this.mailService.sendCode(body.email, body.purpose || 'login');
      return { success: true, ...result };
    } catch (e: any) {
      throw new BadRequestException(e.message || '发送失败');
    }
  }

  @Post('login/code')
  @ApiOperation({ summary: '邮箱验证码登录（未注册自动创建账号）' })
  async loginByCode(@Body() body: { email: string; code: string }) {
    if (!this.mailService.verifyCode(body.email, body.code)) {
      throw new BadRequestException('验证码错误或已过期');
    }
    return this.authService.loginByCode(body.email);
  }

  @Post('login/wechat')
  @ApiOperation({ summary: '微信小程序登录（新用户需绑定邮箱）' })
  wechatLogin(@Body() body: { code: string }) {
    return this.authService.wechatLogin(body.code);
  }

  @Post('wechat/bind')
  @ApiOperation({ summary: '微信绑定邮箱（已注册邮箱需验证码）' })
  wechatBind(@Body() body: { bindToken: string; email: string; code?: string }) {
    return this.authService.wechatBind(body.bindToken, body.email, body.code);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码（只需邮箱验证码）' })
  changePassword(
    @Request() req: any,
    @Body() body: { newPassword: string; email: string; code: string },
  ) {
    if (!this.mailService.verifyCode(body.email, body.code)) {
      throw new BadRequestException('验证码错误或已过期');
    }
    return this.authService.changePassword(req.user.id, body.newPassword);
  }
}
