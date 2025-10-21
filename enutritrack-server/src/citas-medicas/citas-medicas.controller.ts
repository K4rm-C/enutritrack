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
import { CitasMedicasService } from './citas-medicas.service';
import { CreateCitaMedicaDto } from './dto/create-citas-medicas.dto';
import { UpdateCitaMedicaDto } from './dto/update-citas-medicas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('citas-medicas')
@UseGuards(JwtAuthGuard)
export class CitasMedicasController {
  constructor(private readonly citasMedicasService: CitasMedicasService) {}

  @Post()
  create(@Body() createCitaMedicaDto: CreateCitaMedicaDto) {
    return this.citasMedicasService.create(createCitaMedicaDto);
  }

  @Get()
  findAll() {
    return this.citasMedicasService.findAll();
  }

  @Get('usuario/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.citasMedicasService.findByUser(userId);
  }

  @Get('doctor/:doctorId')
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.citasMedicasService.findByDoctor(doctorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.citasMedicasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCitaMedicaDto: UpdateCitaMedicaDto) {
    return this.citasMedicasService.update(id, updateCitaMedicaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citasMedicasService.remove(id);
  }
}
