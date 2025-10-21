import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateCategoriaAlertaDto {
  @IsString()
  @MaxLength(50)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
