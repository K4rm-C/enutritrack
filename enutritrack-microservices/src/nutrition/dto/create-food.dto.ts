// src/nutrition/dto/create-food.dto.ts
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateFoodDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  calorias_por_100g: number;

  @IsNumber()
  @Min(0)
  proteinas_g_por_100g: number;

  @IsNumber()
  @Min(0)
  carbohidratos_g_por_100g: number;

  @IsNumber()
  @Min(0)
  grasas_g_por_100g: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fibra_g_por_100g?: number;

  @IsOptional()
  @IsString()
  categoria?: string;
}
