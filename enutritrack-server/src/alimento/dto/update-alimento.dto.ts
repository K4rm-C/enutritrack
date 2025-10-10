import { PartialType } from '@nestjs/mapped-types';
import { CreateAlimentoDto } from './create-alimento.dtio';

export class UpdateAlimentoDto extends PartialType(CreateAlimentoDto) {}
