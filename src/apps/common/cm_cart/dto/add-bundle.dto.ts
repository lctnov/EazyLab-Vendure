import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddBundleDto {
  @ApiProperty({
    description: 'Số lượng sản phẩm muốn thêm vào giỏ (mặc định: 1) !!!',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Số lượng phải là số nguyên !!!' })
  @Min(1, { message: 'Số lượng sản phẩm trong giỏ hàng ít nhất là 1 !!!' })
  @Type(() => Number)
  quantity?: number = 1;
}