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
import { HistorialPesoService } from './historial-peso.service';
import { CreateHistorialPesoDto } from './dto/create-historial-peso.dto';
import { UpdateHistorialPesoDto } from './dto/update-historial-peso.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('historial-peso')
@UseGuards(JwtAuthGuard)
export class HistorialPesoController {
  constructor(private readonly historialPesoService: HistorialPesoService) {}

  @Post()
  create(@Body() createHistorialPesoDto: CreateHistorialPesoDto) {
    return this.historialPesoService.create(createHistorialPesoDto);
  }

  @Get()
  findAll() {
    return this.historialPesoService.findAll();
  }

  @Get('usuario/:usuarioId')
  findByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.historialPesoService.findByUsuarioId(usuarioId);
  }

  @Get('ultimo/:usuarioId')
  findUltimoRegistro(@Param('usuarioId') usuarioId: string) {
    return this.historialPesoService.findUltimoRegistro(usuarioId);
  }

  @Get('rango/:usuarioId')
  findByRangoFechas(
    @Param('usuarioId') usuarioId: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.historialPesoService.findByRangoFechas(
      usuarioId,
      new Date(fechaInicio),
      new Date(fechaFin),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialPesoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHistorialPesoDto: UpdateHistorialPesoDto,
  ) {
    return this.historialPesoService.update(id, updateHistorialPesoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialPesoService.remove(id);
  }
}
