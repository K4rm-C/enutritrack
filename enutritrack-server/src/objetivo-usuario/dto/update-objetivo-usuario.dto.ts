import { PartialType } from '@nestjs/mapped-types';
import { CreateObjetivoUsuarioDto } from './create-objetivo-usuario.dto';

export class UpdateObjetivoUsuarioDto extends PartialType(
  CreateObjetivoUsuarioDto,
) {}
