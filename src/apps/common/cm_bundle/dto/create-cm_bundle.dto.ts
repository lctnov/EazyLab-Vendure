import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsNumber,
  IsEnum,
  ValidateIf,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PriceStrategy } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BundleItemDto {
  @IsInt()
  @Type(() => Number)
  variantId: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class CreateBundleDto {
  @ApiProperty({ example: 'BND_SKINCARE' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Combo Chăm Sóc Da' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Gồm kem dưỡng + serum' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'SUM', enum: PriceStrategy })
  @IsEnum(PriceStrategy)
  priceStrategy: PriceStrategy;

  @ApiPropertyOptional({ example: 20.00, description: 'Chỉ dùng khi PERCENT' })
  @ValidateIf(o => o.priceStrategy === PriceStrategy.PERCENT)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99.99)
  discountValue?: number;

  @ApiPropertyOptional({ example: 399.99, description: 'Chỉ dùng khi FIXED' })
  @ValidateIf(o => o.priceStrategy === PriceStrategy.FIXED)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fixedPrice?: number;

  @ApiProperty({ type: [BundleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  items: BundleItemDto[];
}