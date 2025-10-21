import { IsString, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';

export class CreateNivelPrioridadAlertaDto {
  @IsString()
  @MaxLength(50)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  nivel_numerico: number;
}
