import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsNotEmpty,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecommendationDto {
  @IsNotEmpty()
  @IsString()
  usuario_id: string;

  @IsNotEmpty()
  @IsString()
  tipo_recomendacion_id: string;

  @IsNotEmpty()
  @IsString()
  contenido: string;

  @IsOptional()
  @IsString()
  @IsEnum(['baja', 'media', 'alta'])
  prioridad?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  vigencia_hasta?: Date;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;

  @IsOptional()
  @IsString()
  cita_medica_id?: string;

  @IsOptional()
  @IsString()
  alerta_generadora_id?: string;
}

export class CreateAIRecommendationDto {
  @IsNotEmpty()
  @IsString()
  usuario_id: string;

  @IsNotEmpty()
  @IsString()
  tipo_recomendacion_id: string;

  @IsOptional()
  @IsString()
  @IsEnum(['baja', 'media', 'alta'])
  prioridad?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  vigencia_hasta?: Date;

  @IsOptional()
  @IsString()
  contexto_adicional?: string;
}

export class UpdateRecommendationDto {
  @IsOptional()
  @IsString()
  tipo_recomendacion_id?: string;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['baja', 'media', 'alta'])
  prioridad?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  vigencia_hasta?: Date;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

export class CreateRecommendationTypeDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  categoria?: string;
}

export class UpdateRecommendationTypeDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  categoria?: string;
}
