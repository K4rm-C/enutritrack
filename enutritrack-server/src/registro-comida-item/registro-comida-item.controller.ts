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
import { RegistroComidaItemsService } from './registro-comida-item.service';
import { CreateRegistroComidaItemDto } from './dto/create-registro-comida-item.dto';
import { UpdateRegistroComidaItemDto } from './dto/update-registro-comida-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('registro-comida-items')
@UseGuards(JwtAuthGuard)
export class RegistroComidaItemsController {
  constructor(
    private readonly registroComidaItemsService: RegistroComidaItemsService,
  ) {}

  @Post()
  create(@Body() createRegistroComidaItemDto: CreateRegistroComidaItemDto) {
    return this.registroComidaItemsService.create(createRegistroComidaItemDto);
  }

  @Post('multiple')
  createMultiple(@Body() items: CreateRegistroComidaItemDto[]) {
    return this.registroComidaItemsService.createMultiple(items);
  }

  @Get()
  findAll() {
    return this.registroComidaItemsService.findAll();
  }

  @Get('registro-comida/:registroComidaId')
  findByRegistroComidaId(@Param('registroComidaId') registroComidaId: string) {
    return this.registroComidaItemsService.findByRegistroComidaId(
      registroComidaId,
    );
  }

  @Get('nutricional/:registroComidaId')
  calcularTotalNutricional(
    @Param('registroComidaId') registroComidaId: string,
  ) {
    return this.registroComidaItemsService.calcularTotalNutricional(
      registroComidaId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registroComidaItemsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRegistroComidaItemDto: UpdateRegistroComidaItemDto,
  ) {
    return this.registroComidaItemsService.update(
      id,
      updateRegistroComidaItemDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registroComidaItemsService.remove(id);
  }

  @Delete('registro-comida/:registroComidaId')
  removeByRegistroComidaId(
    @Param('registroComidaId') registroComidaId: string,
  ) {
    return this.registroComidaItemsService.removeByRegistroComidaId(
      registroComidaId,
    );
  }
}
