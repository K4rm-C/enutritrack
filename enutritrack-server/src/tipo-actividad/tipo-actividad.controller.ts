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
} from '@nestjs/common';
import { TiposActividadService } from './tipo-actividad.service';
import { CreateTipoActividadDto } from './dto/create-tipo-actividad.dto';
import { UpdateTipoActividadDto } from './dto/update-tipo-actividad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tipos-actividad')
@UseGuards(JwtAuthGuard)
export class TiposActividadController {
  constructor(private readonly tiposActividadService: TiposActividadService) {}

  @Post()
  create(@Body() createTipoActividadDto: CreateTipoActividadDto) {
    return this.tiposActividadService.create(createTipoActividadDto);
  }

  @Get()
  findAll() {
    return this.tiposActividadService.findAll();
  }

  @Get('categoria/:categoria')
  findByCategoria(@Param('categoria') categoria: string) {
    return this.tiposActividadService.findByCategoria(categoria);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiposActividadService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTipoActividadDto: UpdateTipoActividadDto,
  ) {
    return this.tiposActividadService.update(id, updateTipoActividadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tiposActividadService.remove(id);
  }
}
