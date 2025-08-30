import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';

@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @UseGuards(CookieAuthGuard)
  @Post()
  create(@Body() createRecommendationDto: any) {
    return this.recommendationService.generateRecommendation(
      createRecommendationDto,
    );
  }

  @UseGuards(CookieAuthGuard)
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.recommendationService.findByUser(userId);
  }

  @UseGuards(CookieAuthGuard)
  @Get('user/:userId/:type')
  findActiveByUserAndType(
    @Param('userId') userId: string,
    @Param('type') type: string,
  ) {
    return this.recommendationService.findActiveByUserAndType(userId, type);
  }

  @UseGuards(CookieAuthGuard)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.recommendationService.deactivate(id);
  }

  @UseGuards(CookieAuthGuard)
  @Get('health')
  testConnection() {
    return this.recommendationService.testRecommendationServiceConnection();
  }
}
