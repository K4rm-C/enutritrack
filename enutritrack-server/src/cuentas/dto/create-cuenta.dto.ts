import { IsEmail, IsEnum, IsBoolean, IsOptional, IsString } from 'class-validator';
import { TipoCuentaEnum } from '../../shared/enum';

export class CreateCuentaDto {
  @IsEmail()
  email: string;

  @IsEmail()
  @IsOptional()
  email_1?: string;

  @IsEmail()
  @IsOptional()
  email_2?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(TipoCuentaEnum)
  tipo_cuenta: TipoCuentaEnum;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}
