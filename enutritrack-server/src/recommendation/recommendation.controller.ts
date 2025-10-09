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
import { RecommendationType } from './models/recommendation.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recommendations')
export class RecommendationController {
  private readonly logger = new Logger(RecommendationController.name);

  constructor(private readonly recommendationService: RecommendationService) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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
}
