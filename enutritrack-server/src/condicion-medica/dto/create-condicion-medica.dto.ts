import {
  IsUUID,
  IsString,
  IsEnum,
  IsDate,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { SeveridadEnum } from '../../shared/enum';

export class CreateCondicionMedicaDto {
  @IsUUID()
  usuario_id: string;

  @IsString()
  nombre: string;

  @IsEnum(SeveridadEnum)
  @IsOptional()
  severidad?: SeveridadEnum;

  @IsDate()
  @IsOptional()
  fecha_diagnostico?: Date;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}
