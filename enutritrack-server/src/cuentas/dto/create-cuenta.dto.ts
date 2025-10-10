import { IsEmail, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { TipoCuentaEnum } from '../../shared/enum';

export class CreateCuentaDto {
  @IsEmail()
  email: string;

  @IsEnum(TipoCuentaEnum)
  tipo_cuenta: TipoCuentaEnum;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}
