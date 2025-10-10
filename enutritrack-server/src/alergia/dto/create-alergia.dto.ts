import {
  IsUUID,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { SeveridadEnum } from '../../shared/enum';

export class CreateAlergiaDto {
  @IsUUID()
  usuario_id: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  nombre: string;

  @IsEnum(SeveridadEnum)
  severidad: SeveridadEnum;

  @IsString()
  @IsOptional()
  reaccion?: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}
