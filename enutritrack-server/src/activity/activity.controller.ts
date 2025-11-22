// src/physical-activity/physical-activity.controller.ts
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
  Req,
} from '@nestjs/common';
import { PhysicalActivityService } from './activity.service';
import express from 'express';
import { JwtAuthGuard } from '../couchbase/auth/guards/jwt-auth.guard';
import { TiposActividadService } from '../tipo-actividad/tipo-actividad.service';

@Controller('physical-activity')
export class PhysicalActivityController {
  constructor(
    private readonly physicalActivityService: PhysicalActivityService,
    private readonly tiposActividadService: TiposActividadService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: express.Request,
    @Body() createPhysicalActivityDto: any,
  ) {
    const userId = (req as any).user?.userId || (req as any).user?.sub;
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');
    const dtoWithUserId = {
      ...createPhysicalActivityDto,
      usuarioId: userId,
    };

    return this.physicalActivityService.create(dtoWithUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async findAllByUser(@Req() req: express.Request) {
    const userId = (req as any).user?.userId || (req as any).user?.sub;
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    return this.physicalActivityService.findAllByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('weekly-summary/:userId')
  async getWeeklySummary(
    @Req() req: express.Request,
    @Query('startDate') startDate: string,
  ) {
    const userId = (req as any).user?.userId || (req as any).user?.sub;
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    const targetDate = startDate ? new Date(startDate) : new Date();
    return this.physicalActivityService.getWeeklySummary(userId, targetDate);
  }

  @UseGuards(JwtAuthGuard)
  @Get('types')
  async getActivityTypes(@Req() req: express.Request) {
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    return this.tiposActividadService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Req() req: express.Request, @Param('id') id: string) {
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    return this.physicalActivityService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: express.Request,
    @Param('id') id: string,
    @Body() updatePhysicalActivityDto: any,
  ) {
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    return this.physicalActivityService.update(id, updatePhysicalActivityDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Req() req: express.Request, @Param('id') id: string) {
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    return this.physicalActivityService.remove(id);
  }
}
