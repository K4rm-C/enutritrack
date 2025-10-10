import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistroComidaItemDto } from './create-registro-comida-item.dto';

export class UpdateRegistroComidaItemDto extends PartialType(
  CreateRegistroComidaItemDto,
) {}
