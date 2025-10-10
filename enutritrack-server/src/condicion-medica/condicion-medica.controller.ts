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
import { CondicionesMedicasService } from './condicion-medica.service';
import { CreateCondicionMedicaDto } from './dto/create-condicion-medica.dto';
import { UpdateCondicionMedicaDto } from './dto/update-condicion-medica.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('condiciones-medicas')
@UseGuards(JwtAuthGuard)
export class CondicionesMedicasController {
  constructor(
    private readonly condicionesMedicasService: CondicionesMedicasService,
  ) {}

  @Post()
  create(@Body() createCondicionMedicaDto: CreateCondicionMedicaDto) {
    return this.condicionesMedicasService.create(createCondicionMedicaDto);
  }

  @Get()
  findAll() {
    return this.condicionesMedicasService.findAll();
  }

  @Get('usuario/:usuarioId')
  findByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.condicionesMedicasService.findByUsuarioId(usuarioId);
  }

  @Get('activas/:usuarioId')
  findActivasByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.condicionesMedicasService.findActivasByUsuarioId(usuarioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.condicionesMedicasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCondicionMedicaDto: UpdateCondicionMedicaDto,
  ) {
    return this.condicionesMedicasService.update(id, updateCondicionMedicaDto);
  }

  @Patch('desactivar/:id')
  desactivar(@Param('id') id: string) {
    return this.condicionesMedicasService.desactivar(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.condicionesMedicasService.remove(id);
  }
}
