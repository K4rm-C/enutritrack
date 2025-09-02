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
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';
import express from 'express';

@Controller('medical-history')
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @UseGuards(CookieAuthGuard)
  @Post()
  async create(@Body() createMedicalHistoryDto: any) {
    return this.medicalHistoryService.create(createMedicalHistoryDto);
  }

  @UseGuards(CookieAuthGuard)
  @Get(':userId')
  async findByUser(@Param('userId') userId: string) {
    return this.medicalHistoryService.findByUser(userId);
  }

  @UseGuards(CookieAuthGuard)
  @Patch(':userId')
  async update(
    @Req() req: express.Request,
    @Param('userId') userId: string,
    @Body() updateMedicalHistoryDto: any,
  ) {
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
