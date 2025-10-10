import { PartialType } from '@nestjs/mapped-types';
import { CreateRecomendacionDatoDto } from './create-recomendacion-dato.dto';

export class UpdateRecomendacionDatoDto extends PartialType(
  CreateRecomendacionDatoDto,
) {}
