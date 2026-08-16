import { IsString, IsInt, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: '目标类型(prompt/article)' })
  @IsString()
  targetType: string;

  @ApiProperty({ description: '目标ID' })
  @IsInt()
  targetId: number;

  @ApiProperty({ description: '父评论ID(回复时使用)', required: false })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiProperty({ description: '评论内容' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}
