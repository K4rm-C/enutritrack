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

@Controller('recommendations')
@UseGuards(CookieAuthGuard)
export class RecommendationController {
  private readonly logger = new Logger(RecommendationController.name);

  constructor(private readonly recommendationService: RecommendationService) {}

  @Post()
  async create(
    @Body() createRecommendationDto: any,
    @Req() req: express.Request,
  ) {
    try {
      // Extraer el token del header de autorización que el guard ya estableció
      const authHeader = req.headers.authorization;
      return await this.recommendationService.generateRecommendation(
        createRecommendationDto,
        authHeader,
      );
    } catch (error) {
      throw new HttpException(
        `Error creating recommendation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Req() req: express.Request,
  ) {
    try {
      const authHeader = req.headers.authorization;
      return await this.recommendationService.findByUser(userId, authHeader);
    } catch (error) {
      throw new HttpException(
        `Error fetching user recommendations: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId/:type')
  async findActiveByUserAndType(
    @Param('userId') userId: string,
    @Param('type') type: string,
    @Req() req: express.Request,
  ) {
    try {
      // Validar que el tipo sea válido
      const validTypes = ['nutrition', 'exercise', 'medical', 'general'];
      if (!validTypes.includes(type)) {
        throw new HttpException(
          `Invalid recommendation type. Valid types are: ${validTypes.join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const authHeader = req.headers.authorization;
      return await this.recommendationService.findActiveByUserAndType(
        userId,
        type,
        authHeader,
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

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string, @Req() req: express.Request) {
    try {
      const authHeader = req.headers.authorization;
      const result = await this.recommendationService.deactivate(
        id,
        authHeader,
      );
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

  @Get('health')
  async testConnection(@Req() req: express.Request) {
    try {
      const authHeader = req.headers.authorization;
      const isHealthy =
        await this.recommendationService.testRecommendationServiceConnection(
          authHeader,
        );

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'recommendation-service',
      };
    } catch (error) {
      throw new HttpException(
        `Health check failed: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // Endpoint adicional para obtener estadísticas de recomendaciones por usuario
  @Get('stats/:userId')
  async getUserRecommendationStats(
    @Param('userId') userId: string,
    @Req() req: express.Request,
  ) {
    try {
      const authHeader = req.headers.authorization;
      const allRecommendations = await this.recommendationService.findByUser(
        userId,
        authHeader,
      );

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
  @Post('quick/nutrition/:userId')
  async quickNutritionRecommendation(
    @Param('userId') userId: string,
    @Req() req: express.Request,
  ) {
    try {
      // Debug logging para ver qué está llegando
      this.logger.log(
        `Raw userId parameter received: ${JSON.stringify(userId)}`,
      );
      this.logger.log(`Type of userId: ${typeof userId}`);
      this.logger.log(`Full params object: ${JSON.stringify(req.params)}`);

      // Convertir a string si es necesario
      let cleanUserId: string;
      if (typeof userId === 'object') {
        // Si es un objeto, intentar extraer el ID
        cleanUserId = req.params.userId || req.params['userId'] || '';
      } else {
        cleanUserId = String(userId);
      }

      this.logger.log(`Clean userId after processing: ${cleanUserId}`);

      // Validar que userId sea válido
      if (
        !cleanUserId ||
        cleanUserId.trim() === '' ||
        cleanUserId === 'undefined' ||
        cleanUserId === 'null'
      ) {
        throw new HttpException(
          'Invalid or missing userId parameter',
          HttpStatus.BAD_REQUEST,
        );
      }

      const authHeader = req.headers.authorization;
      this.logger.log(
        `Quick nutrition recommendation requested for user: ${cleanUserId}`,
      );

      return await this.recommendationService.quickNutritionRecommendation(
        cleanUserId.trim(),
        authHeader,
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

  @Post('quick/exercise/:userId')
  async quickExerciseRecommendation(
    @Param('userId') userId: string,
    @Req() req: express.Request,
  ) {
    try {
      // Debug logging para ver qué está llegando
      this.logger.log(
        `Raw userId parameter received: ${JSON.stringify(userId)}`,
      );
      this.logger.log(`Type of userId: ${typeof userId}`);

      // Convertir a string si es necesario
      let cleanUserId: string;
      if (typeof userId === 'object') {
        cleanUserId = req.params.userId || req.params['userId'] || '';
      } else {
        cleanUserId = String(userId);
      }

      // Validar que userId sea válido
      if (
        !cleanUserId ||
        cleanUserId.trim() === '' ||
        cleanUserId === 'undefined' ||
        cleanUserId === 'null'
      ) {
        throw new HttpException(
          'Invalid or missing userId parameter',
          HttpStatus.BAD_REQUEST,
        );
      }

      const authHeader = req.headers.authorization;
      this.logger.log(
        `Quick exercise recommendation requested for user: ${cleanUserId}`,
      );

      return await this.recommendationService.quickExerciseRecommendation(
        cleanUserId.trim(),
        authHeader,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Controller error: ${error.message}`);
      throw new HttpException(
        `Error generating quick exercise recommendation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('quick/medical/:userId')
  async quickMedicalRecommendation(
    @Param('userId') userId: string,
    @Req() req: express.Request,
  ) {
    try {
      // Debug logging para ver qué está llegando
      this.logger.log(
        `Raw userId parameter received: ${JSON.stringify(userId)}`,
      );
      this.logger.log(`Type of userId: ${typeof userId}`);

      // Convertir a string si es necesario
      let cleanUserId: string;
      if (typeof userId === 'object') {
        cleanUserId = req.params.userId || req.params['userId'] || '';
      } else {
        cleanUserId = String(userId);
      }

      // Validar que userId sea válido
      if (
        !cleanUserId ||
        cleanUserId.trim() === '' ||
        cleanUserId === 'undefined' ||
        cleanUserId === 'null'
      ) {
        throw new HttpException(
          'Invalid or missing userId parameter',
          HttpStatus.BAD_REQUEST,
        );
      }

      const authHeader = req.headers.authorization;
      this.logger.log(
        `Quick medical recommendation requested for user: ${cleanUserId}`,
      );

      return await this.recommendationService.quickMedicalRecommendation(
        cleanUserId.trim(),
        authHeader,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Controller error: ${error.message}`);
      throw new HttpException(
        `Error generating quick medical recommendation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
