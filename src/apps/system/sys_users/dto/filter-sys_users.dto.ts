import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEmail } from 'class-validator';

export class FilterSysUserDto {
  @ApiPropertyOptional({ description: 'Lọc theo tên đăng nhập' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Lọc theo email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Lọc theo vai trò', enum: ['admin', 'user'] })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isactive?: boolean;
}
