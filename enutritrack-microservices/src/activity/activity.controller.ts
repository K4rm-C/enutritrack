import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { PhysicalActivityService } from './activity.service';
import {
  CreatePhysicalActivityDto,
  UpdatePhysicalActivityDto,
} from './dto/create-physical-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('physical-activity')
export class PhysicalActivityController {
  constructor(
    private readonly physicalActivityService: PhysicalActivityService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDto: CreatePhysicalActivityDto) {
    return this.physicalActivityService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  findAllByUser(@Param('userId') userId: string) {
    return this.physicalActivityService.findAllByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId/weekly-summary')
  getWeeklySummary(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
  ) {
    const targetDate = startDate ? new Date(startDate) : new Date();
    return this.physicalActivityService.getWeeklySummary(userId, targetDate);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId/monthly-stats')
  getMonthlyStats(
    @Param('userId') userId: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.physicalActivityService.getMonthlyStats(userId, year, month);
  }

  @UseGuards(JwtAuthGuard)
  @Get('types')
  getActivityTypes() {
    return this.physicalActivityService.getActivityTypes();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.physicalActivityService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePhysicalActivityDto,
  ) {
    return this.physicalActivityService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.physicalActivityService.delete(id);
  }

  @Get('health/check')
  @HttpCode(200)
  healthCheck() {
    return this.physicalActivityService.healthCheck();
  }
}
