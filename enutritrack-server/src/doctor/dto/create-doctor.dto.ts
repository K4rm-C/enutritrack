import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreatePerfilDoctorDto {
  @IsUUID()
  cuenta_id: string;

  @IsUUID()
  @IsOptional()
  admin_id?: string;

  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  especialidad?: string;

  @IsString()
  @IsOptional()
  cedula_profesional?: string;

  @IsString()
  @IsOptional()
  telefono?: string;
}
