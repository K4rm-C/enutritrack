import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NivelesPrioridadAlertaService } from './niveles-prioridad-alerta.service';
import { CreateNivelPrioridadAlertaDto } from './dto/create-niveles-prioridad-alerta.dto';
import { UpdateNivelPrioridadAlertaDto } from './dto/update-niveles-prioridad-alerta.dto';

@Controller('niveles-prioridad-alerta')
export class NivelesPrioridadAlertaController {
  constructor(private readonly nivelesPrioridadAlertaService: NivelesPrioridadAlertaService) {}

  @Post()
  create(@Body() createNivelPrioridadAlertaDto: CreateNivelPrioridadAlertaDto) {
    return this.nivelesPrioridadAlertaService.create(createNivelPrioridadAlertaDto);
  }

  @Get()
  findAll() {
    return this.nivelesPrioridadAlertaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nivelesPrioridadAlertaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNivelPrioridadAlertaDto: UpdateNivelPrioridadAlertaDto) {
    return this.nivelesPrioridadAlertaService.update(id, updateNivelPrioridadAlertaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nivelesPrioridadAlertaService.remove(id);
  }
}
