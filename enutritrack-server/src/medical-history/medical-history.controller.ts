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
import { JwtAuthGuard } from '../couchbase/auth/guards/jwt-auth.guard';

@Controller('medical-history')
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: express.Request,
    @Body() createMedicalHistoryDto: any,
  ) {
    const userId = (req as any).user?.userId || (req as any).user?.sub;

    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');
    const dtoWithUserId = {
      ...createMedicalHistoryDto,
      usuarioId: userId,
    };
    return this.medicalHistoryService.create(dtoWithUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async findByUser(@Req() req: express.Request) {
    const userId = (req as any).user?.userId || (req as any).user?.sub;
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    return this.medicalHistoryService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  async update(
    @Req() req: express.Request,
    @Body() updateMedicalHistoryDto: any,
  ) {
    const userId = (req as any).user?.userId || (req as any).user?.sub;
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    return this.medicalHistoryService.update(userId, updateMedicalHistoryDto);
  }
}
