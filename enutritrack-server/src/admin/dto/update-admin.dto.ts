import { PartialType } from '@nestjs/mapped-types';
import { CreatePerfilAdminDto } from './create-admin.dto';

export class UpdatePerfilAdminDto extends PartialType(CreatePerfilAdminDto) {}
