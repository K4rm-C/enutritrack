import { IsEmail, IsString } from 'class-validator';

export class LoginCuentaDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
