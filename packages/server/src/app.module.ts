import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { LlmModule } from './common/llm/llm.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PromptModule } from './prompt/prompt.module';
import { CategoryModule } from './category/category.module';
import { TagModule } from './tag/tag.module';
import { CommentModule } from './comment/comment.module';
import { FavoriteModule } from './favorite/favorite.module';
import { RatingModule } from './rating/rating.module';
import { SearchModule } from './search/search.module';
import { ArticleModule } from './article/article.module';
import { AiToolModule } from './ai-tool/ai-tool.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    LlmModule,
    AuthModule,
    UserModule,
    PromptModule,
    CategoryModule,
    TagModule,
    CommentModule,
    FavoriteModule,
    RatingModule,
    SearchModule,
    ArticleModule,
    AiToolModule,
    AdminModule,
    UploadModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
