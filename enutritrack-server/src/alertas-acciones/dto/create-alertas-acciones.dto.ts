import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateAlertaAccionDto {
  @IsUUID()
  alerta_id: string;

  @IsUUID()
  doctor_id: string;

  @IsString()
  @MaxLength(200)
  accion_tomada: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
