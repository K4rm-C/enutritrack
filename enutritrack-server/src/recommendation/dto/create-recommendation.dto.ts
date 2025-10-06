// src/recommendation/dto/create-recommendation.dto.ts
import {
  IsEnum,
  IsUUID,
  IsObject,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { RecommendationType } from '../models/recommendation.model';

export class CreateRecommendationDto {
  @IsUUID()
  usuarioId: string;

  @IsEnum(RecommendationType)
  tipo: RecommendationType;

  @IsObject()
  @IsOptional()
  datosEntrada?: any;
}
export class GeminiRequestDto {
  @IsUUID()
  usuarioId: string;

  @IsEnum(RecommendationType)
  tipo: RecommendationType;

  @IsObject()
  datosUsuario: any;

  @IsObject()
  @IsOptional()
  datosEspecificos?: any;
}
