import {
  IsUUID,
  IsString,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { GeneroEnum } from '../../shared/enum';

export class CreatePerfilUsuarioDto {
  @IsUUID()
  cuenta_id: string;

  @IsUUID()
  @IsOptional()
  doctor_id?: string;

  @IsString()
  nombre: string;

  @IsDate()
  fecha_nacimiento: Date;

  @IsEnum(GeneroEnum)
  genero: GeneroEnum;

  @IsNumber()
  altura: number;

  @IsString()
  @IsOptional()
  telefono?: string;
}
