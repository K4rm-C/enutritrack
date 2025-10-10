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
import { ObjetivoUsuarioService } from './objetivo-usuario.service';
import { CreateObjetivoUsuarioDto } from './dto/create-objetivo-usuario.dto';
import { UpdateObjetivoUsuarioDto } from './dto/update-objetivo-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('objetivo-usuario')
@UseGuards(JwtAuthGuard)
export class ObjetivoUsuarioController {
  constructor(
    private readonly objetivoUsuarioService: ObjetivoUsuarioService,
  ) {}

  @Post()
  async create(@Body() createObjetivoUsuarioDto: CreateObjetivoUsuarioDto) {
    // Desactivar objetivos anteriores antes de crear uno nuevo
    await this.objetivoUsuarioService.desactivarObjetivosAnteriores(
      createObjetivoUsuarioDto.usuario_id,
    );
    return this.objetivoUsuarioService.create(createObjetivoUsuarioDto);
  }

  @Get()
  findAll() {
    return this.objetivoUsuarioService.findAll();
  }

  @Get('usuario/:usuarioId')
  findByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.objetivoUsuarioService.findByUsuarioId(usuarioId);
  }

  @Get('vigente/:usuarioId')
  findVigenteByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.objetivoUsuarioService.findVigenteByUsuarioId(usuarioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.objetivoUsuarioService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateObjetivoUsuarioDto: UpdateObjetivoUsuarioDto,
  ) {
    return this.objetivoUsuarioService.update(id, updateObjetivoUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.objetivoUsuarioService.remove(id);
  }
}
