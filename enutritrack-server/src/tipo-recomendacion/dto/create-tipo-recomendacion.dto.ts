import { IsString, IsOptional } from 'class-validator';

export class CreateTipoRecomendacionDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  categoria?: string;
}
