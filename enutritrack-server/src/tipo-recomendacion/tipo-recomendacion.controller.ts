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
import { TiposRecomendacionService } from './tipo-recomendacion.service';
import { CreateTipoRecomendacionDto } from './dto/create-tipo-recomendacion.dto';
import { UpdateTipoRecomendacionDto } from './dto/update-tipo-recomendacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tipos-recomendacion')
@UseGuards(JwtAuthGuard)
export class TiposRecomendacionController {
  constructor(
    private readonly tiposRecomendacionService: TiposRecomendacionService,
  ) {}

  @Post()
  create(@Body() createTipoRecomendacionDto: CreateTipoRecomendacionDto) {
    return this.tiposRecomendacionService.create(createTipoRecomendacionDto);
  }

  @Get()
  findAll() {
    return this.tiposRecomendacionService.findAll();
  }

  @Get('categoria/:categoria')
  findByCategoria(@Param('categoria') categoria: string) {
    return this.tiposRecomendacionService.findByCategoria(categoria);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiposRecomendacionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTipoRecomendacionDto: UpdateTipoRecomendacionDto,
  ) {
    return this.tiposRecomendacionService.update(
      id,
      updateTipoRecomendacionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tiposRecomendacionService.remove(id);
  }
}
