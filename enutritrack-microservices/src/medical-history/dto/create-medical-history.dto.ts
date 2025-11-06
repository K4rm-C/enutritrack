// src/medical-history/dto/create-medical-history.dto.ts
import {
  IsUUID,
  IsArray,
  IsOptional,
  IsString,
  IsBoolean,
  IsDate,
  IsEnum,
} from 'class-validator';

export class CondicionMedicaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsEnum(['leve', 'moderada', 'severa'])
  severidad?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsDate()
  fecha_diagnostico?: Date;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

export class AlergiaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  tipo?: string;

  @IsEnum(['leve', 'moderada', 'severa'])
  severidad: string;

  @IsOptional()
  @IsString()
  reaccion?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

export class MedicamentoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  dosis?: string;

  @IsOptional()
  @IsString()
  frecuencia?: string;

  @IsDate()
  fecha_inicio: Date;

  @IsOptional()
  @IsDate()
  fecha_fin?: Date;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

// src/medical-history/dto/create-medical-history.dto.ts
export class CreateMedicalHistoryDto {
  @IsUUID()
  pacienteId: string; // Cambiar de usuarioId a pacienteId

  @IsArray()
  @IsOptional()
  condiciones?: CondicionMedicaDto[];

  @IsArray()
  @IsOptional()
  alergias?: AlergiaDto[];

  @IsArray()
  @IsOptional()
  medicamentos?: MedicamentoDto[];
}
