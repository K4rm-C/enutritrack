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
} from '@nestjs/common';
import { PhysicalActivityService } from './activity.service';
import { CreatePhysicalActivityDto } from './dto/create-physical-activity.dto';
import { UpdatePhysicalActivityDto } from './dto/update-physical-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('physical-activity')
export class PhysicalActivityController {
  constructor(
    private readonly physicalActivityService: PhysicalActivityService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPhysicalActivityDto: CreatePhysicalActivityDto) {
    return this.physicalActivityService.create(createPhysicalActivityDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  findAllByUser(@Param('userId') userId: string) {
    return this.physicalActivityService.findAllByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('weekly-summary/:userId')
  getWeeklySummary(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
  ) {
    const targetDate = startDate ? new Date(startDate) : new Date();
    return this.physicalActivityService.getWeeklySummary(userId, targetDate);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.physicalActivityService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePhysicalActivityDto: UpdatePhysicalActivityDto,
  ) {
    return this.physicalActivityService.update(id, updatePhysicalActivityDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.physicalActivityService.remove(id);
  }
}
