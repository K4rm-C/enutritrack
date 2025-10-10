import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateTipoActividadDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  met_value: number;

  @IsString()
  @IsOptional()
  categoria?: string;
}
