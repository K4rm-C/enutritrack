import { PartialType } from '@nestjs/mapped-types';
import { CreateConfiguracionAlertasAutomaticasDto } from './create-configuracion-alertas-automaticas.dto';

export class UpdateConfiguracionAlertasAutomaticasDto extends PartialType(CreateConfiguracionAlertasAutomaticasDto) {}
