// src/user/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
  })
  contraseña: string;
}
