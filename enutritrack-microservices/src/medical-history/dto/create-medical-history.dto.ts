// src/medical-history/dto/create-medical-history.dto.ts
import { IsUUID, IsArray, IsOptional, IsString } from 'class-validator';

export class CreateMedicalHistoryDto {
  @IsUUID()
  usuarioId: string;

  @IsOptional()
  condiciones?: string[];

  @IsOptional()
  alergias?: string[];

  @IsOptional()
  medicamentos?: string[];
}

export class UpdateMedicalHistoryDto {
  @IsOptional()
  condiciones?: string[];

  @IsOptional()
  alergias?: string[];

  @IsOptional()
  medicamentos?: string[];
}
