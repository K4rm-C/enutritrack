import { IsUUID, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateMedicamentoDto {
  @IsUUID()
  usuario_id: string;

  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  dosis?: string;

  @IsString()
  @IsOptional()
  frecuencia?: string;

  @IsString() // Cambiar a IsNumber para aceptar timestamps
  fecha_inicio: string;

  @IsString()
  @IsOptional()
  fecha_fin?: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}