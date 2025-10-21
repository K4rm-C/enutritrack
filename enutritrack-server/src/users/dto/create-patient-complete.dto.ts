import {
  IsUUID,
  IsString,
  IsDate,
  IsNumber,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreatePatientCompleteDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  contraseña: string;

  @IsUUID()
  @IsOptional()
  genero_id?: string;

  // Campo legacy para compatibilidad con frontend
  @IsString()
  @IsOptional()
  genero?: string;

  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => new Date(value))
  fecha_nacimiento: Date;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  altura: number;

  @IsUUID()
  @IsOptional()
  doctorId?: string;

  // Campo legacy para compatibilidad con frontend
  @IsUUID()
  @IsOptional()
  doctor_id?: string;

  // Campos opcionales del perfil
  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  telefono_1?: string;

  @IsString()
  @IsOptional()
  telefono_2?: string;

  // Campos adicionales que vienen del frontend (no se usan en la creación básica)
  @IsNumber()
  @IsOptional()
  peso_actual?: number;

  @IsNumber()
  @IsOptional()
  objetivo_peso?: number;

  @IsString()
  @IsOptional()
  nivel_actividad?: string;
}
