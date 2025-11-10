import { IsString, IsEnum, IsOptional, IsNumber, ValidateNested, ArrayMinSize, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PriceStrategy, Prisma } from '@prisma/client';

class BundleItemInput {
  @IsNumber()
  @Type(() => Number)
  productVariantId: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class CreateBundleDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PriceStrategy, { message: 'priceStrategy must be SUM, FIXED or PERCENT' })
  priceStrategy: PriceStrategy;

  @IsNumber()
  @Type(() => Number)
  discountValue: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BundleItemInput)
  @ArrayMinSize(0)
  items?: BundleItemInput[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fixedPrice?: Prisma.Decimal | 0;
}