import { 
  IsString, 
  IsOptional, 
  IsUUID, 
  IsDateString, 
  MaxLength 
} from 'class-validator';

export class CreateAlertaDto {
  @IsUUID()
  usuario_id: string;

  @IsOptional()
  @IsUUID()
  doctor_id?: string;

  @IsUUID()
  tipo_alerta_id: string;

  @IsUUID()
  nivel_prioridad_id: string;

  @IsUUID()
  estado_alerta_id: string;

  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsString()
  mensaje: string;

  @IsOptional()
  @IsUUID()
  recomendacion_id?: string;

  @IsOptional()
  @IsDateString()
  fecha_deteccion?: string;

  @IsOptional()
  @IsDateString()
  fecha_resolucion?: string;

  @IsOptional()
  @IsUUID()
  resuelta_por?: string;

  @IsOptional()
  @IsString()
  notas_resolucion?: string;
}
