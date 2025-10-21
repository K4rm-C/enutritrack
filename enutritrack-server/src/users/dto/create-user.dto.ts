import {
  IsUUID,
  IsString,
  IsDate,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreatePerfilUsuarioDto {
  @IsUUID()
  cuenta_id: string;

  @IsUUID()
  @IsOptional()
  doctor_id?: string;

  @IsString()
  nombre: string;

  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => new Date(value))
  fecha_nacimiento: Date;

  @IsUUID()
  genero_id: string;

  @IsNumber()
  altura: number;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  telefono_1?: string;

  @IsString()
  @IsOptional()
  telefono_2?: string;
}
