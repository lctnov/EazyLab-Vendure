import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreateSysUserDto {
  @ApiProperty({ description: 'Địa chỉ email của người dùng', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Tên đăng nhập', example: 'john_doe' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Mật khẩu người dùng (sẽ được mã hóa trước khi lưu)', example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Ngày hết hạn tài khoản', required: false, nullable: true })
  @IsOptional()
  @IsDateString()
  expiredate?: string | null;

  @ApiProperty({ description: 'Ngày sinh của người dùng', required: false, nullable: true })
  @IsOptional()
  @IsDateString()
  birthday?: string | null;

  @ApiProperty({ description: 'Địa chỉ người dùng', required: false, nullable: true })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiProperty({ description: 'Số điện thoại người dùng', required: false, nullable: true })
  @IsOptional()
  @IsString()
  telphone?: string | null;

  @ApiProperty({ description: 'Vai trò của người dùng', required: false, nullable: true, enum: ['admin', 'user'] })
  @IsOptional()
  @IsString()
  role?: string | null;

  @ApiProperty({ description: 'Trạng thái hoạt động của người dùng', default: true })
  @IsOptional()
  @IsBoolean()
  isactive?: boolean;

  @ApiProperty({ description: 'Người tạo bản ghi' })
  @IsString()
  createdby: string;
}
