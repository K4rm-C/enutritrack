import { IsString, IsOptional, IsUUID, IsBoolean, IsObject, MaxLength } from 'class-validator';

export class CreateTipoAlertaDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsUUID()
  categoria_id: string;

  @IsBoolean()
  @IsOptional()
  es_automatica?: boolean;

  @IsObject()
  @IsOptional()
  config_validacion?: any;
}
