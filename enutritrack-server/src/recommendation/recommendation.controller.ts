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
import { RecomendacionService } from './recommendation.service';
import { CreateRecomendacionDto } from './dto/create-recommendation.dto';
import { UpdateRecomendacionDto } from './dto/update-recommendation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recomendacion')
@UseGuards(JwtAuthGuard)
export class RecomendacionController {
  constructor(private readonly recomendacionService: RecomendacionService) {}

  @Post()
  create(@Body() createRecomendacionDto: CreateRecomendacionDto) {
    return this.recomendacionService.create(createRecomendacionDto);
  }

  @Post('completa')
  crearRecomendacionCompleta(
    @Body()
    body: {
      recomendacion: CreateRecomendacionDto;
      datos: { clave: string; valor: string; tipo_dato?: string }[];
    },
  ) {
    return this.recomendacionService.crearRecomendacionCompleta(
      body.recomendacion,
      body.datos,
    );
  }

  @Get()
  findAll() {
    return this.recomendacionService.findAll();
  }

  @Get('usuario/:usuarioId')
  findByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.recomendacionService.findByUsuarioId(usuarioId);
  }

  @Get('activas/:usuarioId')
  findActivasByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.recomendacionService.findActivasByUsuarioId(usuarioId);
  }

  @Get('tipo-recomendacion/:tipoRecomendacionId')
  findByTipoRecomendacionId(
    @Param('tipoRecomendacionId') tipoRecomendacionId: string,
  ) {
    return this.recomendacionService.findByTipoRecomendacionId(
      tipoRecomendacionId,
    );
  }

  @Get('vigentes')
  findVigentes() {
    return this.recomendacionService.findVigentes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recomendacionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRecomendacionDto: UpdateRecomendacionDto,
  ) {
    return this.recomendacionService.update(id, updateRecomendacionDto);
  }

  @Patch('desactivar/:id')
  desactivar(@Param('id') id: string) {
    return this.recomendacionService.desactivar(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recomendacionService.remove(id);
  }
}
