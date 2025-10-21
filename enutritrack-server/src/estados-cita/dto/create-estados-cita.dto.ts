import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateEstadoCitaDto {
  @IsString()
  @MaxLength(50)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  es_final?: boolean;
}
