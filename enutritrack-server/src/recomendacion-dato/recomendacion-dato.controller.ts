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
import { RecomendacionDatosService } from './recomendacion-dato.service';
import { CreateRecomendacionDatoDto } from './dto/create-recomendacion-dato.dto';
import { UpdateRecomendacionDatoDto } from './dto/update-recomendacion-dato.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recomendacion-datos')
@UseGuards(JwtAuthGuard)
export class RecomendacionDatosController {
  constructor(
    private readonly recomendacionDatosService: RecomendacionDatosService,
  ) {}

  @Post()
  create(@Body() createRecomendacionDatoDto: CreateRecomendacionDatoDto) {
    return this.recomendacionDatosService.create(createRecomendacionDatoDto);
  }

  @Post('multiple')
  createMultiple(@Body() datos: CreateRecomendacionDatoDto[]) {
    return this.recomendacionDatosService.createMultiple(datos);
  }

  @Get()
  findAll() {
    return this.recomendacionDatosService.findAll();
  }

  @Get('recomendacion/:recomendacionId')
  findByRecomendacionId(@Param('recomendacionId') recomendacionId: string) {
    return this.recomendacionDatosService.findByRecomendacionId(
      recomendacionId,
    );
  }

  @Get('clave/:clave')
  findByClave(@Param('clave') clave: string) {
    return this.recomendacionDatosService.findByClave(clave);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recomendacionDatosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRecomendacionDatoDto: UpdateRecomendacionDatoDto,
  ) {
    return this.recomendacionDatosService.update(
      id,
      updateRecomendacionDatoDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recomendacionDatosService.remove(id);
  }

  @Delete('recomendacion/:recomendacionId')
  removeByRecomendacionId(@Param('recomendacionId') recomendacionId: string) {
    return this.recomendacionDatosService.removeByRecomendacionId(
      recomendacionId,
    );
  }
}
