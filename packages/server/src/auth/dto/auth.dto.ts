import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsIn, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '邮箱或用户名', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: '用户名', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ description: '密码', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class SendCodeDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '用途', enum: ['change-password', 'register', 'login', 'wechat-bind'] })
  @IsIn(['change-password', 'register', 'login', 'wechat-bind'])
  purpose: 'change-password' | 'register' | 'login' | 'wechat-bind';
}

export class LoginByCodeDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '6位验证码' })
  @Matches(/^\d{6}$/, { message: '验证码格式错误' })
  code: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '6位验证码' })
  @Matches(/^\d{6}$/, { message: '验证码格式错误' })
  code: string;

  @ApiProperty({ description: '新密码', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  newPassword: string;
}

export class RegisterDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '密码', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty({ description: '昵称', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nickname?: string;
}
