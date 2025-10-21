import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateEstadoAlertaDto {
  @IsString()
  @MaxLength(50)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
