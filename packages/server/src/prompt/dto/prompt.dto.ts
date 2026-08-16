import { IsString, IsOptional, IsInt, Min, Max, IsArray, MaxLength, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePromptDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: '描述' })
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ description: '完整Prompt内容' })
  @IsString()
  @MaxLength(20000)
  content: string;

  @ApiProperty({ description: '分类ID' })
  @IsInt()
  categoryId: number;

  @ApiProperty({ description: '难度', required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1) @Max(3)
  difficulty?: number;

  @ApiProperty({ description: '适用AI工具ID列表', required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  aiToolIds?: number[];

  @ApiProperty({ description: '示例图片URL列表', required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(9)
  exampleImages?: string[];
}

export class UpdatePromptDto {
  @ApiProperty({ description: '标题', required: false })
  @IsOptional() @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional() @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: '内容', required: false })
  @IsOptional() @IsString()
  @MaxLength(20000)
  content?: string;

  @ApiProperty({ description: '难度', required: false })
  @IsOptional() @IsInt() @Min(1) @Max(3)
  difficulty?: number;

  @ApiProperty({ description: '适用AI工具ID列表', required: false })
  @IsOptional() @IsArray()
  @ArrayMaxSize(20)
  aiToolIds?: number[];

  @ApiProperty({ description: '示例图片URL列表', required: false })
  @IsOptional() @IsArray()
  @ArrayMaxSize(9)
  exampleImages?: string[];
}

export class QueryPromptDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 12 })
  @IsOptional()
  pageSize?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  difficulty?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  sort?: 'newest' | 'hot' | 'rating';

  @ApiProperty({ required: false })
  @IsOptional()
  aiToolId?: number;
}
