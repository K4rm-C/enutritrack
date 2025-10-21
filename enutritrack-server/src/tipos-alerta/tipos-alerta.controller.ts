import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TiposAlertaService } from './tipos-alerta.service';
import { CreateTipoAlertaDto } from './dto/create-tipos-alerta.dto';
import { UpdateTipoAlertaDto } from './dto/update-tipos-alerta.dto';

@Controller('tipos-alerta')
export class TiposAlertaController {
  constructor(private readonly tiposAlertaService: TiposAlertaService) {}

  @Post()
  create(@Body() createTipoAlertaDto: CreateTipoAlertaDto) {
    return this.tiposAlertaService.create(createTipoAlertaDto);
  }

  @Get()
  findAll() {
    return this.tiposAlertaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiposAlertaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipoAlertaDto: UpdateTipoAlertaDto) {
    return this.tiposAlertaService.update(id, updateTipoAlertaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tiposAlertaService.remove(id);
  }
}
