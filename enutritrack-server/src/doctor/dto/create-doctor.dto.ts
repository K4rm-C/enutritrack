import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreatePerfilDoctorDto {
  @IsUUID()
  cuenta_id: string;

  @IsUUID()
  @IsOptional()
  admin_id?: string;

  @IsString()
  nombre: string;

  @IsUUID()
  @IsOptional()
  especialidad_id?: string;

  @IsString()
  @IsOptional()
  cedula_profesional?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  telefono_1?: string;

  @IsString()
  @IsOptional()
  telefono_2?: string;
}
