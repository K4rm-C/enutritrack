import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { Recommendation } from './models/recommendation.model';
import { RecommendationType } from './models/recommendation.model';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,
  ) {}

  async findByUser(usuarioId: string): Promise<Recommendation[]> {
    try {
      const recommendations = await this.recommendationRepository.find({
        where: { usuario: { id: usuarioId } },
        order: { fechaGeneracion: 'DESC' },
      });

      return recommendations;
    } catch (error) {
      this.logger.error('Error fetching user recommendations:', error);
      throw new HttpException(
        'Failed to fetch recommendations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findActiveByUserAndType(
    usuarioId: string,
    tipo: RecommendationType,
  ): Promise<Recommendation[]> {
    try {
      const recommendations = await this.recommendationRepository.find({
        where: {
          usuario: { id: usuarioId },
          tipo,
          activa: true,
          vigenciaHasta: MoreThan(new Date()),
        },
        order: { fechaGeneracion: 'DESC' },
      });

      return recommendations;
    } catch (error) {
      this.logger.error('Error fetching active recommendations:', error);
      throw new HttpException(
        'Failed to fetch active recommendations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deactivate(id: string): Promise<Recommendation> {
    try {
      const recommendation = await this.recommendationRepository.findOne({
        where: { id },
      });

      if (!recommendation) {
        throw new HttpException(
          'Recommendation not found',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.recommendationRepository.update(id, { activa: false });
      const updatedRecommendation = await this.recommendationRepository.findOne(
        {
          where: { id },
        },
      );

      if (!updatedRecommendation) {
        throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
      }

      return updatedRecommendation;
    } catch (error) {
      this.logger.error('Error deactivating recommendation:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to deactivate recommendation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
