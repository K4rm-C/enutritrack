import { 
  IsString, 
  IsOptional, 
  IsUUID, 
  IsDateString, 
  IsDate,
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCitaMedicaVitalesDto {
  @IsOptional()
  peso?: number;

  @IsOptional()
  altura?: number;

  @IsOptional()
  tension_arterial_sistolica?: number;

  @IsOptional()
  tension_arterial_diastolica?: number;

  @IsOptional()
  frecuencia_cardiaca?: number;

  @IsOptional()
  temperatura?: number;

  @IsOptional()
  saturacion_oxigeno?: number;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class CreateCitaMedicaDto {
  @IsUUID()
  usuario_id: string;

  @IsUUID()
  doctor_id: string;

  @IsUUID()
  tipo_consulta_id: string;

  @IsUUID()
  estado_cita_id: string;

  @IsDate()
  @Type(() => Date)
  fecha_hora_programada: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fecha_hora_inicio?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fecha_hora_fin?: Date;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  tratamiento_recomendado?: string;

  @IsOptional()
  @IsDateString()
  proxima_cita_sugerida?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCitaMedicaVitalesDto)
  vitales?: CreateCitaMedicaVitalesDto;
}
