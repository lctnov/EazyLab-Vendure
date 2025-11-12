import { ApiProperty } from '@nestjs/swagger';

export class OrderRepository {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '123456789' })
  orderId: string;

  @ApiProperty({ example: 'PAYMENT_SETTLED' })
  status: string;

  @ApiProperty({ example: '2025-11-10T16:45:00.000Z' })
  settledAt: Date;
}