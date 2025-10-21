import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaAlertaDto } from './create-categorias-alerta.dto';

export class UpdateCategoriaAlertaDto extends PartialType(CreateCategoriaAlertaDto) {}
