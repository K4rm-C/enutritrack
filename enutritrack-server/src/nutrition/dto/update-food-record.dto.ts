// src/nutrition/dto/update-food-record.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateFoodRecordDto } from './create-food-record.dto';

export class UpdateFoodRecordDto extends PartialType(CreateFoodRecordDto) {}
