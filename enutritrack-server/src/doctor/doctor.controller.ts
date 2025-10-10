import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { PerfilDoctorService } from './doctor.service';
import { CreatePerfilDoctorDto } from './dto/create-doctor.dto';
import { UpdatePerfilDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@Controller('doctors')
@UseGuards(JwtAuthGuard, AdminAuthGuard) // Solo admins pueden acceder
@UseInterceptors(ClassSerializerInterceptor)
export class PerfilDoctorController {
  constructor(private readonly perfilDoctorService: PerfilDoctorService) {}

  @Post()
  create(@Body() createPerfilDoctorDto: CreatePerfilDoctorDto) {
    return this.perfilDoctorService.create(createPerfilDoctorDto);
  }

  @Get()
  findAll() {
    return this.perfilDoctorService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.perfilDoctorService.getDoctorStats();
  }

  @Get('search')
  search(@Query('q') query: string) {
    if (!query) {
      return this.perfilDoctorService.findAll();
    }
    return this.perfilDoctorService.searchDoctores(query);
  }

  @Get('especialidad/:especialidad')
  getDoctoresPorEspecialidad(@Param('especialidad') especialidad: string) {
    return this.perfilDoctorService.getDoctoresPorEspecialidad(especialidad);
  }

  @Get('cuenta/:cuentaId')
  findByCuentaId(@Param('cuentaId') cuentaId: string) {
    return this.perfilDoctorService.findByCuentaId(cuentaId);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.perfilDoctorService.findByEmail(email);
  }

  @Get('cedula/:cedula')
  findByCedula(@Param('cedula') cedula: string) {
    return this.perfilDoctorService.findByCedula(cedula);
  }

  @Get('pacientes/:id')
  getPacientes(@Param('id') id: string) {
    return this.perfilDoctorService.getPacientes(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.perfilDoctorService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePerfilDoctorDto: UpdatePerfilDoctorDto,
  ) {
    return this.perfilDoctorService.update(id, updatePerfilDoctorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.perfilDoctorService.remove(id);
  }
}
