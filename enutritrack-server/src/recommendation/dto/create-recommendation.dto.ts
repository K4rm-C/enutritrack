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

  @IsUUID()
  tipo_recomendacion_id: string;

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
