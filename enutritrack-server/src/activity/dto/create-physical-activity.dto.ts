import {
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  IsDate,
} from 'class-validator';

export class CreateActividadFisicaDto {
  @IsUUID()
  usuario_id: string;

  @IsUUID()
  tipo_actividad_id: string;

  @IsNumber()
  duracion_min: number;

  @IsNumber()
  calorias_quemadas: number;

  @IsString()
  @IsOptional()
  intensidad?: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsDate()
  @IsOptional()
  fecha?: Date;
}
