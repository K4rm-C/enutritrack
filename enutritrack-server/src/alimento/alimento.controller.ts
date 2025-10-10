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
import { AlimentosService } from './alimento.service';
import { CreateAlimentoDto } from './dto/create-alimento.dtio';
import { UpdateAlimentoDto } from './dto/update-alimento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('alimentos')
@UseGuards(JwtAuthGuard)
export class AlimentosController {
  constructor(private readonly alimentosService: AlimentosService) {}

  @Post()
  create(@Body() createAlimentoDto: CreateAlimentoDto) {
    return this.alimentosService.create(createAlimentoDto);
  }

  @Get()
  findAll() {
    return this.alimentosService.findAll();
  }

  @Get('categoria/:categoria')
  findByCategoria(@Param('categoria') categoria: string) {
    return this.alimentosService.findByCategoria(categoria);
  }

  @Get('buscar')
  searchByName(@Query('nombre') nombre: string) {
    return this.alimentosService.searchByName(nombre);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alimentosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAlimentoDto: UpdateAlimentoDto,
  ) {
    return this.alimentosService.update(id, updateAlimentoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alimentosService.remove(id);
  }
}
