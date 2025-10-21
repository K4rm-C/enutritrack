import { PartialType } from '@nestjs/mapped-types';
import { CreateAlertaAccionDto } from './create-alertas-acciones.dto';

export class UpdateAlertaAccionDto extends PartialType(CreateAlertaAccionDto) {}
