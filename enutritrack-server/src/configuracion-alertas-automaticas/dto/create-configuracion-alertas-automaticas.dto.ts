import { 
  IsString, 
  IsOptional, 
  IsUUID, 
  IsBoolean, 
  IsInt, 
  Min,
  IsObject 
} from 'class-validator';

export class CreateConfiguracionAlertasAutomaticasDto {
  @IsUUID()
  usuario_id: string;

  @IsUUID()
  tipo_alerta_id: string;

  @IsOptional()
  @IsUUID()
  doctor_id?: string;

  @IsBoolean()
  @IsOptional()
  esta_activa?: boolean;

  @IsOptional()
  @IsObject()
  umbral_configuracion?: any;

  @IsInt()
  @Min(1)
  @IsOptional()
  frecuencia_verificacion_horas?: number;
}
