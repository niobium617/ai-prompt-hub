import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RatePromptDto {
  @ApiProperty({ description: '评分 1-5' })
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;
}
