import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoAlertaDto } from './create-tipos-alerta.dto';

export class UpdateTipoAlertaDto extends PartialType(CreateTipoAlertaDto) {}
