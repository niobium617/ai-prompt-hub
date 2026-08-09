import { IsString, IsInt, IsOptional, IsArray, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: '摘要' })
  @IsString()
  @MaxLength(500)
  summary: string;

  @ApiProperty({ description: '内容(Markdown)' })
  @IsString()
  content: string;

  @ApiProperty({ description: '分类ID', required: false })
  @IsOptional() @IsInt()
  categoryId?: number;

  @ApiProperty({ description: '标签ID列表', required: false })
  @IsOptional() @IsArray()
  tagIds?: number[];

  @ApiProperty({ description: '章节结构', required: false })
  @IsOptional()
  chapterStructure?: object[];
}
