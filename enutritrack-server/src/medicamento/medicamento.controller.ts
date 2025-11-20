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
import { MedicamentosService } from './medicamento.service';
import { CreateMedicamentoDto } from './dto/create-medicamento.dto';
import { UpdateMedicamentoDto } from './dto/update-medicamento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('medicamentos')
@UseGuards(JwtAuthGuard)
export class MedicamentosController {
  constructor(private readonly medicamentosService: MedicamentosService) { }

  @Post()
  create(@Body() createMedicamentoDto: CreateMedicamentoDto) {
    return this.medicamentosService.create(createMedicamentoDto);
  }

  @Get()
  findAll() {
    return this.medicamentosService.findAll();
  }

  @Get('usuario/:usuarioId')
  findByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.medicamentosService.findByUsuarioId(usuarioId);
  }

  @Get('activos/:usuarioId')
  findActivosByUsuarioId(@Param('usuarioId') usuarioId: string) {
    return this.medicamentosService.findActivosByUsuarioId(usuarioId);
  }

  @Get('vigentes')
  findActivosVigentes() {
    return this.medicamentosService.findActivosVigentes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicamentosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicamentoDto: UpdateMedicamentoDto,
  ) {
    return this.medicamentosService.update(id, updateMedicamentoDto);
  }

  @Patch('desactivar/:id')
  desactivar(@Param('id') id: string) {
    return this.medicamentosService.desactivar(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicamentosService.remove(id);
  }
}
