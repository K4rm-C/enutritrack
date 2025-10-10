import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateAlimentoDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  calorias_por_100g: number;

  @IsNumber()
  proteinas_g_por_100g: number;

  @IsNumber()
  carbohidratos_g_por_100g: number;

  @IsNumber()
  grasas_g_por_100g: number;

  @IsNumber()
  @IsOptional()
  fibra_g_por_100g?: number;

  @IsString()
  @IsOptional()
  categoria?: string;
}
