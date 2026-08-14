import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('系统')
@Controller('config')
export class ConfigController {
  @Get()
  @ApiOperation({ summary: '获取系统配置（开发模式状态等）' })
  getConfig() {
    return {
      devMode: process.env.DEV_MODE === 'true',
      version: '1.0.0',
    };
  }
}
