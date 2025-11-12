// src/apps/common/cm_bundle/dto/update-cm_bundle.dto.ts
import { IsOptional, IsString, IsInt} from 'class-validator';
import { PriceStrategy } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateBundleDto {
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
}