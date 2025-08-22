// src/user/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  MinLength,
  IsNumber,
  IsEnum,
  IsDateString,
  Matches,
} from 'class-validator';
import { Gender, ActivityLevel } from '../models/user.model';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8) // Aumenté a 8 caracteres mínimo
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
  })
  contraseña: string; // ← Cambié a contraseña para que coincida con tu request

  @IsDateString()
  fecha_nacimiento: string;

  @IsEnum(Gender)
  género: Gender;

  @IsNumber()
  altura: number;

  @IsNumber()
  peso_actual: number;

  @IsNumber()
  objetivo_peso: number;

  @IsEnum(ActivityLevel)
  nivel_actividad: ActivityLevel;
}
