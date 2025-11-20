// src/nutrition/dto/create-food-record.dto.ts
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TipoComidaEnum } from '../../shared/enums';
import { Transform } from 'class-transformer';

export class CreateFoodRecordDto {
  @IsUUID()
  usuarioId: string;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  fecha?: Date;

  @IsEnum(TipoComidaEnum)
  tipo_comida: TipoComidaEnum;

  @IsOptional()
  @IsString()
  notas?: string;
}
