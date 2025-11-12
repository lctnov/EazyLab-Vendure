import { IsString, IsOptional, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PriceStrategy } from '@prisma/client';

class BundleItemDto {
  @IsInt()
  @Type(() => Number)
  variantId: number;

  @IsInt()
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

  @IsString()
  priceStrategy: PriceStrategy;

  @IsInt()
  discountValue: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  fixedPrice?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  items?: BundleItemDto[];
}