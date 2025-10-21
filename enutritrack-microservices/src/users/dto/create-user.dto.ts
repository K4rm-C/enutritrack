import {
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ActivityLevel } from '../models/user.model';
import { Transform, Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  nombre: string;

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

  // Campo legacy para compatibilidad con frontend
  @IsString()
  @IsOptional()
  contraseña?: string;

  @IsDateString()
  fecha_nacimiento: string;

  @IsUUID()
  @IsOptional()
  genero_id?: string;

  // Campo legacy para compatibilidad con frontend
  @IsString()
  @IsOptional()
  genero?: string;

  @IsNumber()
  @Type(() => Number)
  altura: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  peso_actual?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  objetivo_peso?: number;

  @IsOptional()
  @IsEnum(ActivityLevel)
  nivel_actividad?: ActivityLevel;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  telefono_1?: string;

  @IsOptional()
  @IsString()
  telefono_2?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value, obj }) => {
    return obj.doctor_id || value;
  })
  doctorId?: string;
}
