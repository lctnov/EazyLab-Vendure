import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { PriceStrategy, Prisma } from '@prisma/client';

export class UpdateBundleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PriceStrategy, { message: 'priceStrategy must be SUM, FIXED or PERCENT' })
  priceStrategy?: PriceStrategy; // DÙNG ENUM

  @IsOptional()
  @IsNumber()
  discountValue?: Prisma.Decimal | 0;

  @IsOptional()
  @IsNumber()
  fixedPrice?: Prisma.Decimal | 0;
}