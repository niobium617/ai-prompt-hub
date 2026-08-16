import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminResetPasswordDto {
  @ApiProperty({ description: '新密码', minLength: 10 })
  @IsString()
  @MinLength(10)
  @MaxLength(72)
  password: string;
}
