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
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';
import express from 'express';

@Controller('physical-activity')
export class PhysicalActivityController {
  constructor(
    private readonly physicalActivityService: PhysicalActivityService,
  ) {}

  @UseGuards(CookieAuthGuard)
  @Post()
  async create(
    @Req() req: express.Request,
    @Body() createPhysicalActivityDto: any,
  ) {
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    return this.physicalActivityService.create(
      createPhysicalActivityDto,
      authToken,
    );
  }

  @UseGuards(CookieAuthGuard)
  @Get('user/:userId')
  async findAllByUser(@Req() req: express.Request) {
    const userId = (req as any).user?.userId || (req as any).user?.sub;
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    return this.physicalActivityService.findAllByUser(userId, authToken);
  }

  @UseGuards(CookieAuthGuard)
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
    return this.physicalActivityService.getWeeklySummary(
      userId,
      targetDate,
      authToken,
    );
  }

  @UseGuards(CookieAuthGuard)
  @Get(':id')
  async findOne(@Req() req: express.Request, @Param('id') id: string) {
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    return this.physicalActivityService.findOne(id, authToken);
  }

  @UseGuards(CookieAuthGuard)
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

    return this.physicalActivityService.update(
      id,
      updatePhysicalActivityDto,
      authToken,
    );
  }

  @UseGuards(CookieAuthGuard)
  @Delete(':id')
  async remove(@Req() req: express.Request, @Param('id') id: string) {
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    return this.physicalActivityService.remove(id, authToken);
  }
}
