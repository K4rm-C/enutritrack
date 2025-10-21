import { PartialType } from '@nestjs/mapped-types';
import { CreateNivelPrioridadAlertaDto } from './create-niveles-prioridad-alerta.dto';

export class UpdateNivelPrioridadAlertaDto extends PartialType(CreateNivelPrioridadAlertaDto) {}
