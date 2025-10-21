import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreateTipoConsultaDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  duracion_minutos?: number;
}
