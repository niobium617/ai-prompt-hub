import {
  Controller, Post, UseInterceptors,
  UploadedFile, UseGuards, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DevWriteGuard } from '../common/dev-mode/dev-write.guard';
import { memoryStorage } from 'multer';
import { join, extname } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';

/** 允许的扩展名（与魔数双重校验，防止 .html 伪装图片造成存储型 XSS） */
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

/** 魔数嗅探：JPEG / PNG / GIF / WEBP */
function sniffImage(buffer: Buffer): string | null {
  if (!buffer || buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'png';
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return 'gif';
  // RIFF 容器：字节 8-11 必须为 'WEBP'
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

@ApiTags('上传')
@Controller('upload')
export class UploadController {
  @Post('image')
  @UseGuards(JwtAuthGuard, DevWriteGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '上传图片（文章/提示词配图）' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/) || !ALLOWED_EXT.has(ext)) {
          cb(new Error('仅支持 jpg/png/gif/webp 图片'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file || !file.buffer) throw new BadRequestException('文件无效');
    // 魔数二次校验（mimetype 与扩展名都可伪造）
    const ext = sniffImage(file.buffer);
    if (!ext) throw new BadRequestException('文件内容不是有效图片');

    const today = new Date().toISOString().slice(0, 10);
    const dir = join(process.cwd(), 'uploads', today);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    // 随机文件名，绝不使用用户提供的文件名
    const filename = `${randomUUID()}.${ext}`;
    writeFileSync(join(dir, filename), file.buffer);

    const url = `/uploads/${today}/${filename}`;
    return { url, filename, size: file.size };
  }
}
