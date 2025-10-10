import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoRecomendacionDto } from './create-tipo-recomendacion.dto';

export class UpdateTipoRecomendacionDto extends PartialType(
  CreateTipoRecomendacionDto,
) {}
