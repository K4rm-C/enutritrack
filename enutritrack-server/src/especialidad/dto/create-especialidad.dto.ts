import { IsString, IsOptional } from 'class-validator';

export class CreateEspecialidadDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
