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
import { AlertasService } from './alertas.service';
import { CreateAlertaDto } from './dto/create-alertas.dto';
import { UpdateAlertaDto } from './dto/update-alertas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('alertas')
@UseGuards(JwtAuthGuard)
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Post()
  create(@Body() createAlertaDto: CreateAlertaDto) {
    return this.alertasService.create(createAlertaDto);
  }

  @Get()
  findAll() {
    return this.alertasService.findAll();
  }

  @Get('usuario/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.alertasService.findByUser(userId);
  }

  @Get('doctor/:doctorId')
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.alertasService.findByDoctor(doctorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlertaDto: UpdateAlertaDto) {
    return this.alertasService.update(id, updateAlertaDto);
  }

  @Patch(':id/resolver/:doctorId')
  resolve(
    @Param('id') id: string,
    @Param('doctorId') doctorId: string,
    @Body() body: { notas_resolucion: string }
  ) {
    return this.alertasService.resolve(id, doctorId, body.notas_resolucion);
  }

  @Post(':id/accion/:doctorId')
  addAction(
    @Param('id') id: string,
    @Param('doctorId') doctorId: string,
    @Body() body: { accion_tomada: string; descripcion?: string }
  ) {
    return this.alertasService.addAction(id, doctorId, body.accion_tomada, body.descripcion);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alertasService.remove(id);
  }
}
