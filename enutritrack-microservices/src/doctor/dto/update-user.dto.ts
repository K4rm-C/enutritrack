// src/nutrition/dto/update-food-record.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-doctor.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
