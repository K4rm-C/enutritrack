import { IsUUID, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateRegistroComidaItemDto {
  @IsUUID()
  registro_comida_id: string;

  @IsUUID()
  alimento_id: string;

  @IsNumber()
  cantidad_gramos: number;

  @IsString()
  @IsOptional()
  notas?: string;
}
