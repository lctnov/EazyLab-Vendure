import { IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class AddItemDto {
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  variantId: number;

  @IsInt()
  @Min(1, { message: 'Quantity must be >= 1' })
  @Type(() => Number)
  quantity: number;
}