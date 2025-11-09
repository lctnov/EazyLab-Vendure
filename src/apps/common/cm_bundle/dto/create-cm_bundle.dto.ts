import { IsNotEmpty, IsString, IsOptional, IsIn, IsNumber, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class BundleItemInput {
  @IsNotEmpty()
  @IsNumber()
  productVariantId: number;

  @IsNotEmpty()
  @Min(1)
  quantity: number;
}

export class CreateBundleDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  description?: string;

  @IsIn(['sum', 'fixed', 'percent'])
  priceStrategy: 'sum' | 'fixed' | 'percent';

  @IsOptional()
  @IsNumber()
  fixedPrice?: number;

  @IsOptional()
  @IsNumber()
  discountValue?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BundleItemInput)
  @ArrayMinSize(0)
  items?: BundleItemInput[];
}
