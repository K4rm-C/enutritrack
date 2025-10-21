// src/user/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  IsUUID,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class CreateDoctorDto {
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
  password: string;

  @IsUUID()
  @IsOptional()
  especialidad_id?: string;

  @IsString()
  @IsOptional()
  cedula?: string;

  @IsString()
  @IsOptional()
  telefono?: string;
}
