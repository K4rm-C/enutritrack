// src/nutrition/dto/create-food-record.dto.ts
import { IsEnum, IsNumber, IsString, IsUUID } from 'class-validator';
import { MealType } from '../models/nutrition.model';
import { Transform } from 'class-transformer';

export class CreateFoodRecordDto {
  @IsUUID()
  usuarioId: string;

  @Transform(({ value }) => new Date(value))
  fecha: Date;

  @IsEnum(MealType)
  tipo_comida: MealType;

  @IsString()
  descripcion: string;

  @IsNumber()
  calorias: number;

  @IsNumber()
  proteinas: number;

  @IsNumber()
  carbohidratos: number;

  @IsNumber()
  grasas: number;
}
