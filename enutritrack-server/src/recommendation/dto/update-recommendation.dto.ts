import { PartialType } from '@nestjs/mapped-types';
import { CreateRecomendacionDto } from './create-recommendation.dto';

export class UpdateRecomendacionDto extends PartialType(
  CreateRecomendacionDto,
) {}
