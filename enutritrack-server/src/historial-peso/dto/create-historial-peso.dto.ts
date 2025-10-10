import {
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  IsDate,
} from 'class-validator';

export class CreateHistorialPesoDto {
  @IsUUID()
  usuario_id: string;

  @IsNumber()
  peso: number;

  @IsDate()
  @IsOptional()
  fecha_registro?: Date;

  @IsString()
  @IsOptional()
  notas?: string;
}
