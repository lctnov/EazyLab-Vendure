import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SettleOrderDto {
  @ApiProperty({
    description: 'Mã của đơn hàng',
    example: '123456789',
  })
  @IsNotEmpty({ message: 'Mã đơn hàng là bắt buộc' })
  orderId: string;
}