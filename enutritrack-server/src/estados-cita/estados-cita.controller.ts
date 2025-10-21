import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EstadosCitaService } from './estados-cita.service';
import { CreateEstadoCitaDto } from './dto/create-estados-cita.dto';
import { UpdateEstadoCitaDto } from './dto/update-estados-cita.dto';

@Controller('estados-cita')
export class EstadosCitaController {
  constructor(private readonly estadosCitaService: EstadosCitaService) {}

  @Post()
  create(@Body() createEstadoCitaDto: CreateEstadoCitaDto) {
    return this.estadosCitaService.create(createEstadoCitaDto);
  }

  @Get()
  findAll() {
    return this.estadosCitaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estadosCitaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstadoCitaDto: UpdateEstadoCitaDto) {
    return this.estadosCitaService.update(id, updateEstadoCitaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estadosCitaService.remove(id);
  }
}
