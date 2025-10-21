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


  @IsBoolean()
  @IsOptional()
  vigente?: boolean;
}
