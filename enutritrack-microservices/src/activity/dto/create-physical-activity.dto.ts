import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreatePhysicalActivityDto {
  @IsString()
  usuario_id: string;

  @IsString()
  tipo_actividad_id: string;

  @IsNumber()
  duracion_min: number;

  @IsNumber()
  @IsOptional()
  calorias_quemadas?: number;

  @IsString()
  @IsOptional()
  intensidad?: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsDateString()
  @IsOptional()
  fecha?: Date;
}

export class UpdatePhysicalActivityDto {
  @IsString()
  @IsOptional()
  tipo_actividad_id?: string;

  @IsNumber()
  @IsOptional()
  duracion_min?: number;

  @IsNumber()
  @IsOptional()
  calorias_quemadas?: number;

  @IsString()
  @IsOptional()
  intensidad?: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsDateString()
  @IsOptional()
  fecha?: Date;
}
