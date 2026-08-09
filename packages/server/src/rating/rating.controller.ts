import { Controller, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('评分')
@Controller('prompts')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post(':id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '评分' })
  rate(@Param('id') id: string, @Request() req, @Body('score') score: number) {
    return this.ratingService.rate(req.user.id, +id, score);
  }
}
