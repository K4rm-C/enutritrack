import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreatePerfilAdminDto {
  @IsUUID()
  cuenta_id: string;

  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsString()
  @IsOptional()
  telefono?: string;
}
