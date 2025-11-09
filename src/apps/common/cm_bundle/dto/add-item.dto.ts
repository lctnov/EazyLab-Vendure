import { IsInt, IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class AddItemDto {
  @IsNotEmpty()
  @IsInt()
  productVariantId: number;

  @IsPositive()
  quantity: number;
}
