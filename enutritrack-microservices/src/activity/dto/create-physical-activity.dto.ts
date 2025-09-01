// src/physical-activity/dto/create-physical-activity.dto.ts
import { Transform } from 'class-transformer';
import { IsUUID, IsString, IsNumber } from 'class-validator';

export class CreatePhysicalActivityDto {
  @IsUUID()
  usuarioId: string;

  @IsString()
  tipo_actividad: string;

  @IsNumber()
  duracion: number;

  @IsNumber()
  caloriasQuemadas: number;

  @Transform(({ value }) => new Date(value))
  fecha: Date;
}
