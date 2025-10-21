import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadoCitaDto } from './create-estados-cita.dto';

export class UpdateEstadoCitaDto extends PartialType(CreateEstadoCitaDto) {}
