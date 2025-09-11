// src/medical-history/dto/create-medical-history.dto.ts
import { IsUUID, IsArray, IsOptional } from 'class-validator';

export class CreateMedicalHistoryDto {
  @IsUUID()
  usuarioId: string;

  @IsArray()
  @IsOptional()
  condiciones?: string[];

  @IsArray()
  @IsOptional()
  alergias?: string[];

  @IsArray()
  @IsOptional()
  medicamentos?: string[];
}
