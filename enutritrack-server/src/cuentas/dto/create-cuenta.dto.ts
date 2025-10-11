import { IsEmail, IsEnum, IsBoolean, IsOptional, IsString } from 'class-validator';
import { TipoCuentaEnum } from '../../shared/enum';

export class CreateCuentaDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(TipoCuentaEnum)
  tipo_cuenta: TipoCuentaEnum;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}
