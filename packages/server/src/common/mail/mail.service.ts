import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  // 内存存储验证码: email -> { code, expires, purpose, attempts, lastSentAt }
  private codeStore = new Map<string, {
    code: string;
    expires: number;
    purpose: string;
    attempts: number;
    lastSentAt: number;
  }>();

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

  /** 是否允许 devCode 降级：仅本地开发模式（生产环境一律 fail-closed，绝不返回验证码） */
  private canUseDevCode(): boolean {
    return process.env.DEV_MODE === 'true' && process.env.NODE_ENV !== 'production';
  }

  /**
   * 发送验证码邮件
   */
  async sendCode(to: string, purpose: 'change-password' | 'register' | 'login' | 'wechat-bind'): Promise<{ devCode?: string }> {
    // 检查发送频率（60秒内不允许重发）
    const existing = this.codeStore.get(to);
    if (existing && Date.now() - existing.lastSentAt < 60 * 1000) {
      throw new Error('发送过于频繁，请稍后再试');
    }

    const code = String(randomInt(100000, 1000000));
    this.codeStore.set(to, {
      code,
      expires: Date.now() + 5 * 60 * 1000,
      purpose,
      attempts: 0,
      lastSentAt: Date.now(),
    });

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

    // 本地开发模式：验证码打到日志并随响应返回（方便联调）
    if (this.canUseDevCode()) {
      this.logger.log(`[DEV] ${to} 的验证码: ${code}`);
      return { devCode: code };
    }

    // 生产环境未配置 SMTP：直接拒绝，绝不把验证码泄露给调用方
    throw new Error('邮件服务未配置，无法发送验证码');
  }

  /**
   * 校验验证码（用途绑定，同一验证码最多尝试 5 次，校验成功后立即失效）
   */
  verifyCode(email: string, code: string, purpose: string): boolean {
    const record = this.codeStore.get(email);
    if (!record) return false;
    if (Date.now() > record.expires) {
      this.codeStore.delete(email);
      return false;
    }
    if (record.purpose !== purpose || record.code !== code) {
      record.attempts += 1;
      if (record.attempts >= 5) this.codeStore.delete(email);
      return false;
    }
    this.codeStore.delete(email);
    return true;
  }
}
