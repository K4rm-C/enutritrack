import { PartialType } from '@nestjs/mapped-types';
import { CreatePhysicalActivityDto } from './create-physical-activity.dto';

export class UpdatePhysicalActivityDto extends PartialType(
  CreatePhysicalActivityDto,
) {}
