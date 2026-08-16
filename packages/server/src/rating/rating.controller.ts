import { Controller, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { RatePromptDto } from './dto/rating.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DevWriteGuard } from '../common/dev-mode/dev-write.guard';

@ApiTags('评分')
@Controller('prompts')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post(':id/rate')
  @UseGuards(JwtAuthGuard, DevWriteGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '评分' })
  rate(@Param('id') id: string, @Request() req: any, @Body() dto: RatePromptDto) {
    return this.ratingService.rate(req.user.id, +id, dto.score);
  }
}
