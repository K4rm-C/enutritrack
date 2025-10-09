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
import express from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: express.Request, @Body() createFoodRecordDto: any) {
    const userId = (req as any).user?.userId || (req as any).user?.sub;

    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');
    const dtoWithUserId = {
      ...createFoodRecordDto,
      usuarioId: userId,
    };

    return this.nutritionService.create(dtoWithUserId);
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

    return this.nutritionService.findAllByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('daily-summary/:userId')
  async getDailySummary(
    @Req() req: express.Request,
    @Query('date') date: string,
  ) {
    const userId = (req as any).user?.userId || (req as any).user?.sub;
    const authToken =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');
    const targetDate = date ? new Date(date) : new Date();
    return this.nutritionService.getDailySummary(userId, targetDate);
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

    return this.nutritionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
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

    return this.nutritionService.update(id, updateFoodRecordDto);
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

    return this.nutritionService.remove(id);
  }
}
