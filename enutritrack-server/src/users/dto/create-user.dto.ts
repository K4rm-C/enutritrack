import {
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Gender, ActivityLevel } from '../models/user.model';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  contraseña: string;

  @IsDateString()
  fecha_nacimiento: string;

  @IsEnum(Gender)
  género: Gender;

  @IsNumber()
  altura: number;

  @IsNumber()
  peso_actual: number;

  @IsOptional()
  @IsNumber()
  objetivo_peso?: number;

  @IsEnum(ActivityLevel)
  nivel_actividad: ActivityLevel;

  @IsOptional()
  @IsString()
  @Transform(({ value, obj }) => {
    // If the request has `doctor_id`, use it, otherwise use `doctorId` (if sent in camelCase)
    return obj.doctor_id || value;
  })
  doctorId?: string;
}
