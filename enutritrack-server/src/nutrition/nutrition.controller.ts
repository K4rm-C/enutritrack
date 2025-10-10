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
import { RegistroComidaService } from './nutrition.service';
import { CreateRegistroComidaDto } from './dto/create-food-record.dto';
import { UpdateRegistroComidaDto } from './dto/update-food-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TipoComidaEnum } from '../shared/enum';

@Controller('registro-comida')
@UseGuards(JwtAuthGuard)
export class RegistroComidaController {
  constructor(private readonly registroComidaService: RegistroComidaService) {}

  @Post()
  create(@Body() createRegistroComidaDto: CreateRegistroComidaDto) {
    return this.registroComidaService.create(createRegistroComidaDto);
  }

  @Get()
  findAll() {
    return this.registroComidaService.findAll();
  }

  @Get('usuario/:usuarioId')
  findByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.registroComidaService.findByUsuarioId(usuarioId);
  }

  @Get('tipo-comida/:usuarioId/:tipoComida')
  findByTipoComida(
    @Param('usuarioId') usuarioId: string,
    @Param('tipoComida') tipoComida: TipoComidaEnum,
  ) {
    return this.registroComidaService.findByTipoComida(usuarioId, tipoComida);
  }

  @Get('rango/:usuarioId')
  findByRangoFechas(
    @Param('usuarioId') usuarioId: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.registroComidaService.findByRangoFechas(
      usuarioId,
      new Date(fechaInicio),
      new Date(fechaFin),
    );
  }

  @Get('resumen/:usuarioId')
  calcularResumenNutricional(
    @Param('usuarioId') usuarioId: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.registroComidaService.calcularResumenNutricional(
      usuarioId,
      new Date(fechaInicio),
      new Date(fechaFin),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registroComidaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRegistroComidaDto: UpdateRegistroComidaDto,
  ) {
    return this.registroComidaService.update(id, updateRegistroComidaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registroComidaService.remove(id);
  }
}
