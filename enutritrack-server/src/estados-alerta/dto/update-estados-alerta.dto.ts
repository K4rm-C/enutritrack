import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadoAlertaDto } from './create-estados-alerta.dto';

export class UpdateEstadoAlertaDto extends PartialType(CreateEstadoAlertaDto) {}
