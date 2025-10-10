import { PartialType } from '@nestjs/mapped-types';
import { CreatePerfilUsuarioDto } from './create-user.dto';

export class UpdatePerfilUsuarioDto extends PartialType(
  CreatePerfilUsuarioDto,
) {}
