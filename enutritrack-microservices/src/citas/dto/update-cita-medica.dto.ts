// src/citas-medicas/dto/update-cita-medica.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCitaMedicaDto } from './create-cita-medica.dto';
import {
  IsUUID,
  IsDateString,
  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class UpdateCitaMedicaDto extends PartialType(CreateCitaMedicaDto) {
  @IsUUID()
  @IsOptional()
  doctorId?: string;

  @IsDateString()
  @IsOptional()
  fechaHoraInicio?: Date;

  @IsDateString()
  @IsOptional()
  fechaHoraFin?: Date;

  @IsString()
  @IsOptional()
  diagnostico?: string;

  @IsString()
  @IsOptional()
  tratamientoRecomendado?: string;

  @IsString()
  @IsOptional()
  proximaCitaSugerida?: Date;
}
