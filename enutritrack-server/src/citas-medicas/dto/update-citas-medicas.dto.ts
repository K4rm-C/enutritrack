import { PartialType } from '@nestjs/mapped-types';
import { CreateCitaMedicaDto } from './create-citas-medicas.dto';

export class UpdateCitaMedicaDto extends PartialType(CreateCitaMedicaDto) {}
