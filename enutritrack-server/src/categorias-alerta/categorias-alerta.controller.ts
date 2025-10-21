import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriasAlertaService } from './categorias-alerta.service';
import { CreateCategoriaAlertaDto } from './dto/create-categorias-alerta.dto';
import { UpdateCategoriaAlertaDto } from './dto/update-categorias-alerta.dto';

@Controller('categorias-alerta')
export class CategoriasAlertaController {
  constructor(private readonly categoriasAlertaService: CategoriasAlertaService) {}

  @Post()
  create(@Body() createCategoriaAlertaDto: CreateCategoriaAlertaDto) {
    return this.categoriasAlertaService.create(createCategoriaAlertaDto);
  }

  @Get()
  findAll() {
    return this.categoriasAlertaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriasAlertaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoriaAlertaDto: UpdateCategoriaAlertaDto) {
    return this.categoriasAlertaService.update(id, updateCategoriaAlertaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriasAlertaService.remove(id);
  }
}
