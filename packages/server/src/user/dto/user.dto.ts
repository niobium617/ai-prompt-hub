import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ description: '昵称', required: false })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  nickname?: string;

  @ApiProperty({ description: '个人简介', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  bio?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
