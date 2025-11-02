import {
  IsUUID,
  IsString,
  IsDate,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateRecomendacionDto {
  @IsUUID()
  usuario_id: string;

  @IsString()
  @IsOptional()
  tipo?: string; // La BD usa 'tipo' como string, no como FK

  @IsString()
  contenido: string;

  @IsDate()
  @IsOptional()
  fecha_generacion?: Date;

  @IsDate()
  @IsOptional()
  vigencia_hasta?: Date;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;

  @IsString()
  @IsOptional()
  prioridad?: string;
}
