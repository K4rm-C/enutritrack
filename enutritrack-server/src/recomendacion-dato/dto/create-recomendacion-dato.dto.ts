import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateRecomendacionDatoDto {
  @IsUUID()
  recomendacion_id: string;

  @IsString()
  clave: string;

  @IsString()
  valor: string;

  @IsString()
  @IsOptional()
  tipo_dato?: string;
}
