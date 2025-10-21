import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoConsultaDto } from './create-tipos-consulta.dto';

export class UpdateTipoConsultaDto extends PartialType(CreateTipoConsultaDto) {}
