// src/nutrition/dto/create-food-record.dto.ts
import { IsEnum, IsNumber, IsString, IsUUID, IsDate } from 'class-validator';
import { MealType } from '../models/nutrition.model';

export class CreateFoodRecordDto {
  @IsUUID()
  usuarioId: string;

  @IsDate()
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
