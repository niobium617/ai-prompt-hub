import { IsString, IsInt, IsOptional, IsArray, MaxLength, ArrayMaxSize, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDraftDto {
  @ApiProperty({ description: '来源提示词ID' })
  @IsInt()
  sourcePromptId: number;
}

export class UpdateDraftDto {
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
}
