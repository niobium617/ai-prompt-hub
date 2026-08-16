/**
 * AI Prompt Hub
 * 版权 (C) 2026 niobium617 — 仅供个人学习，禁止商用
 * 详情见 LICENSE 文件
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 单层 Nginx 反代：限流按真实客户端 IP 计算
  app.set('trust proxy', 1);

  // 安全响应头（CSP 关闭：Element Plus 内联样式；HSTS 由 nginx 在 HTTPS 层下发）
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, hsts: false }));

  // 全局前缀
  app.setGlobalPrefix('api/v1');

  // 参数校验
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  });

  const port = process.env.PORT || 3000;

  // Swagger 文档：生产环境禁用（nginx 层还有 /api/docs 兜底拦截）
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AI Prompt Hub API')
      .setDescription('AI提示词社区分享平台接口文档')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    console.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);
  }

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();
