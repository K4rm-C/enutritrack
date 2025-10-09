// src/medical-history/medical-history.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MedicalHistoryService } from './medical-history.service';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';
import { UpdateMedicalHistoryDto } from './dto/update-medical-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('medical-history')
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createMedicalHistoryDto: CreateMedicalHistoryDto,
    @Req() req: any,
  ) {
    // Obtener userId del token en lugar del body
    const userId = req.user?.userId || req.user?.sub;
    const dtoWithUserId = {
      ...createMedicalHistoryDto,
      usuarioId: userId, // Usar el userId del token
    };
    return this.medicalHistoryService.create(dtoWithUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async findByUser(@Param('userId') userId: string) {
    try {
      const medicalHistory =
        await this.medicalHistoryService.findByUser(userId);
      return medicalHistory;
    } catch (error) {
      console.error('Error en controller:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateMedicalHistoryDto: UpdateMedicalHistoryDto,
  ) {
    return this.medicalHistoryService.update(userId, updateMedicalHistoryDto);
  }
}
