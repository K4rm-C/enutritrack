import {
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Gender, ActivityLevel } from '../models/user.model';
import { Transform, Type } from 'class-transformer';

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
  @Type(() => Number)
  altura: number;

  @IsNumber()
  @Type(() => Number)
  peso_actual: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  objetivo_peso?: number;

  @IsEnum(ActivityLevel)
  nivel_actividad: ActivityLevel;

  @IsOptional()
  @IsString()
  @Transform(({ value, obj }) => {
    return obj.doctor_id || value;
  })
  doctorId?: string;
}
