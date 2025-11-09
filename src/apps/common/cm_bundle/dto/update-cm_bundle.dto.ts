import { IsOptional, IsString, IsIn, IsNumber } from 'class-validator';

export class UpdateBundleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['sum', 'fixed', 'percent'])
  priceStrategy?: 'sum' | 'fixed' | 'percent';

  @IsOptional()
  @IsNumber()
  fixedPrice?: number;

  @IsOptional()
  @IsNumber()
  discountValue?: number;
}
