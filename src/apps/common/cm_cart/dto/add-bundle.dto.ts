import { IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddBundleDto {
  @ApiProperty({ example: 1, description: 'ID của bundle' })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  bundleId!: number;

  @ApiProperty({ example: 1, description: 'Số lượng bundle', minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number;
}