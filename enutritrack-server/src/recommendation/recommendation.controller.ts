import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import express from 'express';
import { RecommendationService } from './recommendation.service';
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';
import { RecommendationType } from './models/recommendation.model';

@Controller('recommendations')
export class RecommendationController {
  private readonly logger = new Logger(RecommendationController.name);

  constructor(private readonly recommendationService: RecommendationService) {}

  @UseGuards(CookieAuthGuard)
  @Post()
  async create(
    @Body() createRecommendationDto: any,
    @Req() req: express.Request,
  ) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.sub;
      const authToken =
        req.cookies?.access_token ||
        req.headers.authorization?.replace('Bearer ', '');
      const dtoWithUserId = {
        ...createRecommendationDto,
        usuarioId: userId,
      };
      return await this.recommendationService.generateRecommendation(
        dtoWithUserId,
      );
    } catch (error) {
      throw new HttpException(
        `Error creating recommendation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(CookieAuthGuard)
  @Get('user/:userId')
  async findByUser(@Req() req: express.Request) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.sub;
      const authToken =
        req.cookies?.access_token ||
        req.headers.authorization?.replace('Bearer ', '');
      return await this.recommendationService.findByUser(userId);
    } catch (error) {
      throw new HttpException(
        `Error fetching user recommendations: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(CookieAuthGuard)
  @Get('user/:userId/:type')
  async findActiveByUserAndType(
    @Param('type') type: RecommendationType,
    @Req() req: express.Request,
  ) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.sub;
      const authToken =
        req.cookies?.access_token ||
        req.headers.authorization?.replace('Bearer ', '');
      const validTypes = ['nutrition', 'exercise', 'medical', 'general'];
      if (!validTypes.includes(type)) {
        throw new HttpException(
          `Invalid recommendation type. Valid types are: ${validTypes.join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.recommendationService.findActiveByUserAndType(
        userId,
        type,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error fetching active recommendations: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(CookieAuthGuard)
  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string, @Req() req: express.Request) {
    try {
      const authToken =
        req.cookies?.access_token ||
        req.headers.authorization?.replace('Bearer ', '');
      const result = await this.recommendationService.deactivate(id);
      return {
        message: 'Recommendation deactivated successfully',
        id,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        `Error deactivating recommendation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Endpoint adicional para obtener estadísticas de recomendaciones por usuario
  @UseGuards(CookieAuthGuard)
  @Get('stats/:userId')
  async getUserRecommendationStats(@Req() req: express.Request) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.sub;
      const authToken =
        req.cookies?.access_token ||
        req.headers.authorization?.replace('Bearer ', '');
      const allRecommendations =
        await this.recommendationService.findByUser(userId);
      const stats = {
        total: allRecommendations.length,
        byType: {} as Record<string, number>,
        lastGenerated:
          allRecommendations.length > 0
            ? allRecommendations[0].fechaGeneracion
            : null,
      };

      // Contar por tipo
      allRecommendations.forEach((rec) => {
        stats.byType[rec.tipo] = (stats.byType[rec.tipo] || 0) + 1;
      });

      return stats;
    } catch (error) {
      throw new HttpException(
        `Error fetching recommendation stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Recomendaciones rápidas
  @UseGuards(CookieAuthGuard)
  @Post('quick-nutrition/:userId')
  async quickNutritionRecommendation(@Req() req: express.Request) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.sub;
      const authToken =
        req.cookies?.access_token ||
        req.headers.authorization?.replace('Bearer ', '');

      return await this.recommendationService.quickNutritionRecommendation(
        userId,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Controller error: ${error.message}`);
      throw new HttpException(
        `Error generating quick nutrition recommendation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(CookieAuthGuard)
  @Post('quick-exercise/:userId')
  async quickExerciseRecommendation(@Req() req: express.Request) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.sub;
      const authToken =
        req.cookies?.access_token ||
        req.headers.authorization?.replace('Bearer ', '');
      return await this.recommendationService.quickExerciseRecommendation(
        userId,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error generating quick exercise recommendation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(CookieAuthGuard)
  @Post('quick-medical/:userId')
  async quickMedicalRecommendation(@Req() req: express.Request) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.sub;
      const authToken =
        req.cookies?.access_token ||
        req.headers.authorization?.replace('Bearer ', '');
      return await this.recommendationService.quickMedicalRecommendation(
        userId,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error generating quick medical recommendation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
