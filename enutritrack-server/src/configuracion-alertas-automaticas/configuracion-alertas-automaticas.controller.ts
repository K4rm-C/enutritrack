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
import { ConfiguracionAlertasAutomaticasService } from './configuracion-alertas-automaticas.service';
import { CreateConfiguracionAlertasAutomaticasDto } from './dto/create-configuracion-alertas-automaticas.dto';
import { UpdateConfiguracionAlertasAutomaticasDto } from './dto/update-configuracion-alertas-automaticas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('configuracion-alertas-automaticas')
@UseGuards(JwtAuthGuard)
export class ConfiguracionAlertasAutomaticasController {
  constructor(private readonly configuracionAlertasAutomaticasService: ConfiguracionAlertasAutomaticasService) {}

  @Post()
  create(@Body() createConfiguracionDto: CreateConfiguracionAlertasAutomaticasDto) {
    return this.configuracionAlertasAutomaticasService.create(createConfiguracionDto);
  }

  @Get()
  findAll() {
    return this.configuracionAlertasAutomaticasService.findAll();
  }

  @Get('activas')
  findByActive() {
    return this.configuracionAlertasAutomaticasService.findByActive();
  }

  @Get('usuario/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.configuracionAlertasAutomaticasService.findByUser(userId);
  }

  @Get('usuario/:userId/tipo/:tipoAlertaId')
  findByUserAndTipoAlerta(
    @Param('userId') userId: string,
    @Param('tipoAlertaId') tipoAlertaId: string
  ) {
    return this.configuracionAlertasAutomaticasService.findByUserAndTipoAlerta(userId, tipoAlertaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.configuracionAlertasAutomaticasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConfiguracionDto: UpdateConfiguracionAlertasAutomaticasDto) {
    return this.configuracionAlertasAutomaticasService.update(id, updateConfiguracionDto);
  }

  @Patch(':id/toggle-activa')
  toggleActive(@Param('id') id: string) {
    return this.configuracionAlertasAutomaticasService.toggleActive(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configuracionAlertasAutomaticasService.remove(id);
  }
}
