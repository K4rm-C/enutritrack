import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistroComidaDto } from './create-food-record.dto';

export class UpdateRegistroComidaDto extends PartialType(
  CreateRegistroComidaDto,
) {}
