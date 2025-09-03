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
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';
import express from 'express';

@Controller('medical-history')
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @UseGuards(CookieAuthGuard)
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
    return this.medicalHistoryService.create(dtoWithUserId, authToken);
  }

  @UseGuards(CookieAuthGuard)
  @Get(':userId')
  async findByUser(@Req() req: express.Request) {
    const userId = (req as any).user?.userId || (req as any).user?.sub;
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    return this.medicalHistoryService.findByUser(userId, authToken);
  }

  @UseGuards(CookieAuthGuard)
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

    return this.medicalHistoryService.update(
      userId,
      updateMedicalHistoryDto,
      authToken,
    );
  }
}
