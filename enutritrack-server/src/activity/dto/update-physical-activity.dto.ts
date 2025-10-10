import { PartialType } from '@nestjs/mapped-types';
import { CreateActividadFisicaDto } from './create-physical-activity.dto';

export class UpdateActividadFisicaDto extends PartialType(
  CreateActividadFisicaDto,
) {}
