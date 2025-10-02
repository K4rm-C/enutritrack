// src/auth/dto/login.dto.ts
import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;

  @IsString({ message: 'La contraseña es requerida' })
  password: string;

  @IsOptional()
  @IsEnum(['user', 'doctor'], {
    message: 'El tipo de usuario debe ser "user" o "doctor"',
  })
  userType?: 'user' | 'doctor';
}
