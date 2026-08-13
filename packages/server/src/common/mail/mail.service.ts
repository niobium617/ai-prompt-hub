import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  // 内存存储验证码: email -> { code, expires }
  private codeStore = new Map<string, { code: string; expires: number }>();

  constructor(private config: ConfigService) {
    const host = this.config.get('SMTP_HOST');
    const user = this.config.get('SMTP_USER');
    const pass = this.config.get('SMTP_PASS');
    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: 465,
        secure: true,
        auth: { user, pass },
      });
    } else {
      this.logger.warn('SMTP 未配置，验证码将只记录在日志中（开发模式）');
    }
  }

  isConfigured(): boolean {
    return !!this.transporter;
  }

  /**
   * 发送验证码邮件
   */
  async sendCode(to: string, purpose: 'change-password' | 'register' | 'login'): Promise<{ devCode?: string }> {
    // 检查发送频率（60秒内不允许重发）
    const existing = this.codeStore.get(to);
    if (existing && Date.now() - existing.expires < 4 * 60 * 1000) {
      throw new Error('发送过于频繁，请稍后再试');
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.codeStore.set(to, { code, expires: Date.now() + 5 * 60 * 1000 });

    const subject = purpose === 'register' ? '【AI Prompt Hub】注册验证码'
      : purpose === 'login' ? '【AI Prompt Hub】登录验证码'
      : '【AI Prompt Hub】修改密码验证码';
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#3b82f6">🚀 AI Prompt Hub</h2>
        <p>你的${purpose === 'register' ? '注册' : '修改密码'}验证码是：</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#3b82f6;margin:16px 0">${code}</p>
        <p style="color:#666">验证码 5 分钟内有效，请勿泄露给他人。</p>
      </div>
    `;

    if (this.transporter) {
      await this.transporter.sendMail({
        from: this.config.get('SMTP_USER'),
        to,
        subject,
        html,
      });
      this.logger.log(`验证码已发送至 ${to}`);
      return {};
    }

    // 开发模式：验证码打到日志
    this.logger.log(`[DEV] ${to} 的验证码: ${code}`);
    return { devCode: code };
  }

  /**
   * 校验验证码（校验后立即失效）
   */
  verifyCode(email: string, code: string): boolean {
    const record = this.codeStore.get(email);
    if (!record) return false;
    if (Date.now() > record.expires) {
      this.codeStore.delete(email);
      return false;
    }
    if (record.code !== code) return false;
    this.codeStore.delete(email);
    return true;
  }
}
