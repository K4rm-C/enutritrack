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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recommendations')
export class RecommendationController {
  private readonly logger = new Logger(RecommendationController.name);

  constructor(private readonly recommendationService: RecommendationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createRecommendationDto: CreateRecommendationDto,
  ): Promise<Recommendation> {
    try {
      this.logger.log(
        `Creating recommendation for user: ${createRecommendationDto.usuarioId}`,
      );
      return await this.recommendationService.generateRecommendation(
        createRecommendationDto,
      );
    } catch (error) {
      this.logger.error(`Error creating recommendation: ${error.message}`);
      throw new HttpException(
        'Error al crear recomendación',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return await this.recommendationService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Post('quick-nutrition/:userId')
  async quickNutritionRecommendation(
    @Param('userId') userId: string,
  ): Promise<Recommendation> {
    try {
      this.logger.log(
        `Generating quick nutrition recommendation for user: ${userId}`,
      );
      return await this.recommendationService.generateRecommendation({
        usuarioId: userId,
        tipo: RecommendationType.NUTRITION,
        datosEntrada: {}, // Añade datos de entrada vacíos o por defecto
      });
    } catch (error) {
      this.logger.error(
        `Error generating nutrition recommendation: ${error.message}`,
      );
      throw new HttpException(
        'Error al generar recomendación de nutrición',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('quick-exercise/:userId')
  async quickExerciseRecommendation(
    @Param('userId') userId: string,
  ): Promise<Recommendation> {
    try {
      this.logger.log(
        `Generating quick exercise recommendation for user: ${userId}`,
      );
      return await this.recommendationService.generateRecommendation({
        usuarioId: userId,
        tipo: RecommendationType.EXERCISE,
        datosEntrada: {}, // Añade datos de entrada vacíos o por defecto
      });
    } catch (error) {
      this.logger.error(
        `Error generating exercise recommendation: ${error.message}`,
      );
      throw new HttpException(
        'Error al generar recomendación de ejercicio',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('quick-medical/:userId')
  async quickMedicalRecommendation(
    @Param('userId') userId: string,
  ): Promise<Recommendation> {
    try {
      this.logger.log(
        `Generating quick medical recommendation for user: ${userId}`,
      );
      return await this.recommendationService.generateRecommendation({
        usuarioId: userId,
        tipo: RecommendationType.MEDICAL,
        datosEntrada: {},
      });
    } catch (error) {
      this.logger.error(
        `Error generating medical recommendation: ${error.message}`,
      );
      throw new HttpException(
        'Error al generar recomendación médica',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
