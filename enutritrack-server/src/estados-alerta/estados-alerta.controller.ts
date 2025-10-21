import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EstadosAlertaService } from './estados-alerta.service';
import { CreateEstadoAlertaDto } from './dto/create-estados-alerta.dto';
import { UpdateEstadoAlertaDto } from './dto/update-estados-alerta.dto';

@Controller('estados-alerta')
export class EstadosAlertaController {
  constructor(private readonly estadosAlertaService: EstadosAlertaService) {}

  @Post()
  create(@Body() createEstadoAlertaDto: CreateEstadoAlertaDto) {
    return this.estadosAlertaService.create(createEstadoAlertaDto);
  }

  @Get()
  findAll() {
    return this.estadosAlertaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estadosAlertaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstadoAlertaDto: UpdateEstadoAlertaDto) {
    return this.estadosAlertaService.update(id, updateEstadoAlertaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estadosAlertaService.remove(id);
  }
}
