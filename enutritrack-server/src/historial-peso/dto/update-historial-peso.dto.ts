import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialPesoDto } from './create-historial-peso.dto';

export class UpdateHistorialPesoDto extends PartialType(
  CreateHistorialPesoDto,
) {}
