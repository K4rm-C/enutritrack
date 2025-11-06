// src/citas-medicas/dto/create-cita-medica.dto.ts
import {
  IsUUID,
  IsDateString,
  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CreateCitaMedicaDto {
  @IsUUID()
  @IsNotEmpty()
  usuarioId: string;

  @IsUUID()
  @IsNotEmpty()
  tipoConsultaId: string;

  @IsUUID()
  @IsNotEmpty()
  estadoCitaId: string;

  @IsDateString()
  @IsNotEmpty()
  fechaHoraProgramada: Date;

  @IsString()
  @IsOptional()
  motivo?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
