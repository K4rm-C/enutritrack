import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { NivelActividadEnum } from '../../shared/enum';

export class CreateObjetivoUsuarioDto {
  @IsUUID()
  usuario_id: string;

  @IsNumber()
  @IsOptional()
  peso_objetivo?: number;

  @IsEnum(NivelActividadEnum)
  nivel_actividad: NivelActividadEnum;

  @IsNumber()
  @IsOptional()
  calorias_objetivo?: number;

  @IsBoolean()
  @IsOptional()
  vigente?: boolean;
}
