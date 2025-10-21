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
import { AlertasAccionesService } from './alertas-acciones.service';
import { CreateAlertaAccionDto } from './dto/create-alertas-acciones.dto';
import { UpdateAlertaAccionDto } from './dto/update-alertas-acciones.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('alertas-acciones')
@UseGuards(JwtAuthGuard)
export class AlertasAccionesController {
  constructor(private readonly alertasAccionesService: AlertasAccionesService) {}

  @Post()
  create(@Body() createAlertaAccionDto: CreateAlertaAccionDto) {
    return this.alertasAccionesService.create(createAlertaAccionDto);
  }

  @Get('alerta/:alertaId')
  findByAlerta(@Param('alertaId') alertaId: string) {
    return this.alertasAccionesService.findByAlerta(alertaId);
  }

  @Get('doctor/:doctorId')
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.alertasAccionesService.findByDoctor(doctorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertasAccionesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlertaAccionDto: UpdateAlertaAccionDto) {
    return this.alertasAccionesService.update(id, updateAlertaAccionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alertasAccionesService.remove(id);
  }
}
