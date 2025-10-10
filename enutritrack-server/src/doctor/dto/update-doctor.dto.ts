import { PartialType } from '@nestjs/mapped-types';
import { CreatePerfilDoctorDto } from './create-doctor.dto';

export class UpdatePerfilDoctorDto extends PartialType(CreatePerfilDoctorDto) {}
