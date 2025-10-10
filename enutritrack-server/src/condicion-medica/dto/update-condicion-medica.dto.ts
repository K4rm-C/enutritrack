import { PartialType } from '@nestjs/mapped-types';
import { CreateCondicionMedicaDto } from './create-condicion-medica.dto';

export class UpdateCondicionMedicaDto extends PartialType(
  CreateCondicionMedicaDto,
) {}
