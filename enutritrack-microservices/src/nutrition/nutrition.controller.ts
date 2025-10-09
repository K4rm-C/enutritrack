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
} from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { CreateFoodRecordDto } from './dto/create-food-record.dto';
import { UpdateFoodRecordDto } from './dto/update-food-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createFoodRecordDto: CreateFoodRecordDto) {
    return this.nutritionService.create(createFoodRecordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  findAllByUser(@Param('userId') userId: string) {
    return this.nutritionService.findAllByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('daily-summary/:userId')
  getDailySummary(
    @Param('userId') userId: string,
    @Query('date') date: string,
  ) {
    const targetDate = date ? new Date(date) : new Date();
    return this.nutritionService.getDailySummary(userId, targetDate);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nutritionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFoodRecordDto: UpdateFoodRecordDto,
  ) {
    return this.nutritionService.update(id, updateFoodRecordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nutritionService.remove(id);
  }
}
