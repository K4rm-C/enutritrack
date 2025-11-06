// src/citas-medicas/citas-medicas.controller.ts
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
  Request,
} from '@nestjs/common';
import { CitasMedicasService } from './citas-medicas.service';
import { CreateCitaMedicaDto } from './dto/create-cita-medica.dto';
import { UpdateCitaMedicaDto } from './dto/update-cita-medica.dto';
import { CitasQueryDto } from './dto/citas-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('citas-medicas')
@UseGuards(JwtAuthGuard)
export class CitasMedicasController {
  constructor(private readonly citasMedicasService: CitasMedicasService) {}

  @Post()
  create(@Body() createCitaMedicaDto: CreateCitaMedicaDto, @Request() req) {
    const doctorId = req.user?.userId || req.user?.sub;
    return this.citasMedicasService.create(createCitaMedicaDto, doctorId);
  }

  @Get()
  findAll(@Query() query: CitasQueryDto) {
    return this.citasMedicasService.findAll(query);
  }

  @Get('mis-citas')
  findMisCitas(@Query() query: CitasQueryDto, @Request() req) {
    return this.citasMedicasService.getCitasPorDoctor(req.user.doctorId, query);
  }

  @Get('estados')
  getEstadosCita() {
    return this.citasMedicasService.getEstadosCita();
  }

  @Get('tipos-consulta')
  getTiposConsulta() {
    return this.citasMedicasService.getTiposConsulta();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.citasMedicasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCitaMedicaDto: UpdateCitaMedicaDto,
  ) {
    return this.citasMedicasService.update(id, updateCitaMedicaDto);
  }

  @Patch(':id/estado/:estadoCitaId')
  cambiarEstado(
    @Param('id') id: string,
    @Param('estadoCitaId') estadoCitaId: string,
  ) {
    return this.citasMedicasService.cambiarEstadoCita(id, estadoCitaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citasMedicasService.remove(id);
  }
}
