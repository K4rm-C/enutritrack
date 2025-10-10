import { IsUUID, IsEnum, IsString, IsOptional, IsDate } from 'class-validator';
import { TipoComidaEnum } from '../../shared/enum';

export class CreateRegistroComidaDto {
  @IsUUID()
  usuario_id: string;

  @IsDate()
  @IsOptional()
  fecha?: Date;

  @IsEnum(TipoComidaEnum)
  tipo_comida: TipoComidaEnum;

  @IsString()
  @IsOptional()
  notas?: string;
}
