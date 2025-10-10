import {
  IsUUID,
  IsString,
  IsDate,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateMedicamentoDto {
  @IsUUID()
  usuario_id: string;

  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  dosis?: string;

  @IsString()
  @IsOptional()
  frecuencia?: string;

  @IsDate()
  fecha_inicio: Date;

  @IsDate()
  @IsOptional()
  fecha_fin?: Date;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
