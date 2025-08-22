// src/physical-activity/dto/create-physical-activity.dto.ts
import { IsUUID, IsString, IsNumber, IsDate } from 'class-validator';

export class CreatePhysicalActivityDto {
  @IsUUID()
  usuarioId: string;

  @IsString()
  tipo_actividad: string;

  @IsNumber()
  duracion: number;

  @IsNumber()
  caloriasQuemadas: number;

  @IsDate()
  fecha: Date;
}
