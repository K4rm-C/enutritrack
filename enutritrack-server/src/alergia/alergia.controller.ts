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
import { AlergiasService } from './alergia.service';
import { CreateAlergiaDto } from './dto/create-alergia.dto';
import { UpdateAlergiaDto } from './dto/update-alergia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('alergias')
@UseGuards(JwtAuthGuard)
export class AlergiasController {
  constructor(private readonly alergiasService: AlergiasService) {}

  @Post()
  create(@Body() createAlergiaDto: CreateAlergiaDto) {
    return this.alergiasService.create(createAlergiaDto);
  }

  @Get()
  findAll() {
    return this.alergiasService.findAll();
  }

  @Get('usuario/:usuarioId')
  findByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.alergiasService.findByUsuarioId(usuarioId);
  }

  @Get('activas/:usuarioId')
  findActivasByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.alergiasService.findActivasByUsuarioId(usuarioId);
  }

  @Get('tipo/:tipo')
  findByTipo(@Param('tipo') tipo: string) {
    return this.alergiasService.findByTipo(tipo);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alergiasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlergiaDto: UpdateAlergiaDto) {
    return this.alergiasService.update(id, updateAlergiaDto);
  }

  @Patch('desactivar/:id')
  desactivar(@Param('id') id: string) {
    return this.alergiasService.desactivar(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alergiasService.remove(id);
  }
}
