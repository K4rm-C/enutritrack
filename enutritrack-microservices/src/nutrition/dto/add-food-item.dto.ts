// src/nutrition/dto/add-food-item.dto.ts
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AddFoodItemDto {
  @IsUUID()
  alimentoId: string;

  @IsNumber()
  @Min(1)
  cantidad_gramos: number;

  @IsOptional()
  @IsString()
  notas?: string;
}
