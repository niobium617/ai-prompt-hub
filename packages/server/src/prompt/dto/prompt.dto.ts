import { IsString, IsOptional, IsInt, Min, Max, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePromptDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '完整Prompt内容' })
  @IsString()
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
  aiToolIds?: number[];

  @ApiProperty({ description: '示例图片URL列表', required: false })
  @IsOptional()
  @IsArray()
  exampleImages?: string[];
}

export class UpdatePromptDto {
  @ApiProperty({ description: '标题', required: false })
  @IsOptional() @IsString()
  title?: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional() @IsString()
  description?: string;

  @ApiProperty({ description: '内容', required: false })
  @IsOptional() @IsString()
  content?: string;

  @ApiProperty({ description: '难度', required: false })
  @IsOptional() @IsInt() @Min(1) @Max(3)
  difficulty?: number;

  @ApiProperty({ description: '适用AI工具ID列表', required: false })
  @IsOptional() @IsArray()
  aiToolIds?: number[];

  @ApiProperty({ description: '示例图片URL列表', required: false })
  @IsOptional() @IsArray()
  exampleImages?: string[];

  @ApiProperty({ description: '状态', required: false })
  @IsOptional() @IsInt()
  status?: number;
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
