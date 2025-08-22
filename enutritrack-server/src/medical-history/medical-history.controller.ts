// src/medical-history/medical-history.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MedicalHistoryService } from './medical-history.service';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';
import { UpdateMedicalHistoryDto } from './dto/update-medical-history.dto';
import { CookieAuthGuard } from 'src/auth/guards/cookie-auth.guard';

@Controller('medical-history')
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @UseGuards(CookieAuthGuard)
  @Post()
  create(@Body() createMedicalHistoryDto: CreateMedicalHistoryDto) {
    return this.medicalHistoryService.create(createMedicalHistoryDto);
  }
  @UseGuards(CookieAuthGuard)
  @Get(':userId')
  findByUser(@Param('userId') userId: string) {
    return this.medicalHistoryService.findByUser(userId);
  }
  @UseGuards(CookieAuthGuard)
  @Patch(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateMedicalHistoryDto: UpdateMedicalHistoryDto,
  ) {
    return this.medicalHistoryService.update(userId, updateMedicalHistoryDto);
  }
}
