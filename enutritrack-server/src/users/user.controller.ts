import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PerfilUsuarioService } from './user.service';
import { CreatePerfilUsuarioDto } from './dto/create-user.dto';
import { CreatePatientCompleteDto } from './dto/create-patient-complete.dto';
import { UpdatePerfilUsuarioDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class PerfilUsuarioController {
  constructor(private readonly perfilUsuarioService: PerfilUsuarioService) {}

  @Post()
  create(@Body() createPerfilUsuarioDto: CreatePerfilUsuarioDto) {
    return this.perfilUsuarioService.create(createPerfilUsuarioDto);
  }

  @Post('complete')
  createComplete(@Body() createPatientCompleteDto: CreatePatientCompleteDto) {
    return this.perfilUsuarioService.createComplete(createPatientCompleteDto);
  }

  @Get()
  findAll() {
    return this.perfilUsuarioService.findAllWithDetails();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.perfilUsuarioService.findOneWithDetails(id);
  }

  @Get('cuenta/:cuentaId')
  findByCuentaId(@Param('cuentaId') cuentaId: string) {
    return this.perfilUsuarioService.findByCuentaId(cuentaId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePerfilUsuarioDto: UpdatePerfilUsuarioDto,
  ) {
    return this.perfilUsuarioService.update(id, updatePerfilUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.perfilUsuarioService.remove(id);
  }

  @Patch(':id/asignar-doctor/:doctorId')
  asignarDoctor(@Param('id') id: string, @Param('doctorId') doctorId: string) {
    return this.perfilUsuarioService.asignarDoctor(id, doctorId);
  }

  @Patch(':id/remover-doctor')
  removerDoctor(@Param('id') id: string) {
    return this.perfilUsuarioService.removerDoctor(id);
  }

  @Get('doctor/:doctorId')
  findByDoctorId(@Param('doctorId') doctorId: string) {
    return this.perfilUsuarioService.findByDoctorId(doctorId);
  }
}
