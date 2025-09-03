// src/nutrition/nutrition.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';
import express from 'express';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @UseGuards(CookieAuthGuard)
  @Post()
  async create(@Req() req: express.Request, @Body() createFoodRecordDto: any) {
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    return this.nutritionService.create(createFoodRecordDto, authToken);
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

    return this.nutritionService.findAllByUser(userId, authToken);
  }

  @UseGuards(CookieAuthGuard)
  @Get('daily-summary/:userId')
  async getDailySummary(
    @Req() req: express.Request,
    @Query('date') date: string,
  ) {
    const userId = (req as any).user?.userId || (req as any).user?.sub;
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    const targetDate = date ? new Date(date) : new Date();
    return this.nutritionService.getDailySummary(userId, targetDate, authToken);
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

    return this.nutritionService.findOne(id, authToken);
  }

  @UseGuards(CookieAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: express.Request,
    @Param('id') id: string,
    @Body() updateFoodRecordDto: any,
  ) {
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    return this.nutritionService.update(id, updateFoodRecordDto, authToken);
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

    return this.nutritionService.remove(id, authToken);
  }
}
