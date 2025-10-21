import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TiposConsultaService } from './tipos-consulta.service';
import { CreateTipoConsultaDto } from './dto/create-tipos-consulta.dto';
import { UpdateTipoConsultaDto } from './dto/update-tipos-consulta.dto';

@Controller('tipos-consulta')
export class TiposConsultaController {
  constructor(private readonly tiposConsultaService: TiposConsultaService) {}

  @Post()
  create(@Body() createTipoConsultaDto: CreateTipoConsultaDto) {
    return this.tiposConsultaService.create(createTipoConsultaDto);
  }

  @Get()
  findAll() {
    return this.tiposConsultaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiposConsultaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipoConsultaDto: UpdateTipoConsultaDto) {
    return this.tiposConsultaService.update(id, updateTipoConsultaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tiposConsultaService.remove(id);
  }
}
