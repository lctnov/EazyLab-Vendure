import { ApiProperty } from '@nestjs/swagger';

export class SysUser {
  @ApiProperty({
    description: 'UUID duy nhất của bản ghi, hệ thống tự sinh',
    readOnly: true,
  })
  rowguid: string;

  @ApiProperty({
    description: 'ID tự tăng của người dùng',
    example: 1,
    readOnly: true,
  })
  id: bigint;

  @ApiProperty({
    description: 'Địa chỉ email duy nhất của người dùng',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Tên đăng nhập',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'Mật khẩu được mã hóa',
    example: 'hashedpassword123',
    writeOnly: true, // Ẩn trên Swagger UI khi trả về response
  })
  password: string;

  @ApiProperty({
    description: 'Ngày hết hạn tài khoản',
    required: false,
    nullable: true,
    example: '2025-12-31T23:59:59Z',
  })
  expiredate?: Date | null;

  @ApiProperty({
    description: 'Ngày sinh',
    required: false,
    nullable: true,
    example: '1990-01-01T00:00:00Z',
  })
  birthday?: Date | null;

  @ApiProperty({
    description: 'Địa chỉ người dùng',
    required: false,
    nullable: true,
  })
  address?: string | null;

  @ApiProperty({
    description: 'Số điện thoại người dùng',
    required: false,
    nullable: true,
  })
  telphone?: string | null;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    required: false,
    nullable: true,
    // enum: ['admin', 'user'],
  })
  role?: string | null;

  @ApiProperty({
    description: 'Trạng thái hoạt động của người dùng',
    default: true,
  })
  isactive: boolean;

  @ApiProperty({
    description: 'Người tạo bản ghi',
    example: 'system',
  })
  createdby: string;

  @ApiProperty({
    description: 'Thời điểm tạo bản ghi',
    example: '2025-08-29T10:00:00Z',
  })
  createdtime: Date;

  @ApiProperty({
    description: 'Người chỉnh sửa cuối cùng',
    required: false,
    nullable: true,
  })
  modifiedby?: string | null;

  @ApiProperty({
    description: 'Thời điểm chỉnh sửa cuối cùng',
    required: false,
    nullable: true,
  })
  modifiedtime?: Date | null;
}
