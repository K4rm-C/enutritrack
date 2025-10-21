import { PartialType } from '@nestjs/mapped-types';
import { CreateAlertaDto } from './create-alertas.dto';

export class UpdateAlertaDto extends PartialType(CreateAlertaDto) {}
