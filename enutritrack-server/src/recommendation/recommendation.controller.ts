import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  ParseEnumPipe,
  Logger,
  HttpStatus,
  HttpException,
  Patch,
} from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import {
  Recommendation,
  RecommendationType,
} from './models/recommendation.model';
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';

@Controller('recommendations')
export class RecommendationController {
  private readonly logger = new Logger(RecommendationController.name);

  constructor(private readonly recommendationService: RecommendationService) {}

  @UseGuards(CookieAuthGuard)
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return await this.recommendationService.findByUser(userId);
  }

  @UseGuards(CookieAuthGuard)
  @Get('user/:userId/type/:type')
  async findByUserAndType(
    @Param('userId') userId: string,
    @Param('type', new ParseEnumPipe(RecommendationType))
    type: RecommendationType,
  ): Promise<Recommendation[]> {
    try {
      this.logger.log(`Fetching ${type} recommendations for user: ${userId}`);
      return await this.recommendationService.findActiveByUserAndType(
        userId,
        type,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching recommendations by type: ${error.message}`,
      );
      throw new HttpException(
        'Error al obtener recomendaciones por tipo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(CookieAuthGuard)
  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string): Promise<{ message: string }> {
    try {
      this.logger.log(`Deactivating recommendation: ${id}`);
      await this.recommendationService.deactivate(id);
      return { message: 'Recomendación desactivada exitosamente' };
    } catch (error) {
      this.logger.error(`Error deactivating recommendation: ${error.message}`);
      throw new HttpException(
        'Error al desactivar recomendación',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
