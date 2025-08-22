// src/recommendation/recommendation.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { Recommendation } from './models/recommendation.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationType } from './models/recommendation.model';
import { CookieAuthGuard } from 'src/auth/guards/cookie-auth.guard';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}
  @UseGuards(CookieAuthGuard)
  @Post()
  async create(
    @Body() createRecommendationDto: CreateRecommendationDto,
  ): Promise<Recommendation> {
    return this.recommendationService.generateRecommendation(
      createRecommendationDto,
    );
  }
  @UseGuards(CookieAuthGuard)
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string): Promise<Recommendation[]> {
    return this.recommendationService.findByUser(userId);
  }
  @UseGuards(CookieAuthGuard)
  @Get('user/:userId/type/:type')
  async findByUserAndType(
    @Param('userId') userId: string,
    @Param('type', new ParseEnumPipe(RecommendationType))
    type: RecommendationType,
  ): Promise<Recommendation[]> {
    return this.recommendationService.findActiveByUserAndType(userId, type);
  }
  @UseGuards(CookieAuthGuard)
  @Delete(':id')
  async deactivate(@Param('id') id: string): Promise<void> {
    return this.recommendationService.deactivate(id);
  }
  @UseGuards(CookieAuthGuard)
  @Post('quick-nutrition/:userId')
  async quickNutritionRecommendation(
    @Param('userId') userId: string,
  ): Promise<Recommendation> {
    return this.recommendationService.generateRecommendation({
      usuarioId: userId,
      tipo: RecommendationType.NUTRITION,
    });
  }
  @UseGuards(CookieAuthGuard)
  @Post('quick-exercise/:userId')
  async quickExerciseRecommendation(
    @Param('userId') userId: string,
  ): Promise<Recommendation> {
    return this.recommendationService.generateRecommendation({
      usuarioId: userId,
      tipo: RecommendationType.EXERCISE,
    });
  }
  @UseGuards(CookieAuthGuard)
  @Post('quick-medical/:userId')
  async quickMedicalRecommendation(
    @Param('userId') userId: string,
  ): Promise<Recommendation> {
    return this.recommendationService.generateRecommendation({
      usuarioId: userId,
      tipo: RecommendationType.MEDICAL,
    });
  }
}
