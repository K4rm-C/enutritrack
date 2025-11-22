// enutritrack-server/src/medical-history/medical-history.controller.ts
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
import express from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('medical-history')
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createMedicalHistoryDto: any) {
    // El usuarioId ahora viene directamente del DTO del frontend
    const { usuarioId } = createMedicalHistoryDto;

    if (!usuarioId) {
      throw new Error('Patient ID (usuarioId) is required');
    }

    return this.medicalHistoryService.create(createMedicalHistoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async findByUser(
    @Param('userId') userId: string,
    @Req() req: express.Request,
  ) {
    // Ahora userId viene del parámetro de ruta
    return this.medicalHistoryService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  async update(
    @Req() req: express.Request,
    @Body() updateMedicalHistoryDto: any,
  ) {
    const { usuarioId } = updateMedicalHistoryDto;
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    return this.medicalHistoryService.update(
      usuarioId,
      updateMedicalHistoryDto,
    );
  }
}
