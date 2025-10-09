import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { join } from 'path';
import type { Response } from 'express';

@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get('management')
  getDoctorsManagement(@Res() res: Response) {
    // Servir el archivo HTML de gestión de doctores
    return res.sendFile(
      join(process.cwd(), 'public', 'doctors-management.html'),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create(createDoctorDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.doctorService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.doctorService.findByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.doctorService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorService.remove(id);
  }
}
