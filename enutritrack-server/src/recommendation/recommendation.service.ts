import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Recommendation,
  RecommendationType,
} from './models/recommendation.model';
import { UserService } from '../users/users.service';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
    private userService: UserService,
  ) {
  }

  async deactivate(id: string): Promise<void> {
    await this.recommendationRepository.update(id, { activa: false });
  }

  async findByUser(userId: string): Promise<Recommendation[]> {
    return this.recommendationRepository.find({
      where: { usuario: { id: userId }, activa: true },
      relations: ['usuario'],
    });
  }

  async findActiveByUserAndType(
    userId: string,
    tipo: RecommendationType,
  ): Promise<Recommendation[]> {
    const now = new Date();
    return this.recommendationRepository.find({
      where: {
        usuario: { id: userId },
        tipo,
        activa: true,
        vigenciaHasta: MoreThan(now),
      },
      order: { fechaGeneracion: 'DESC' },
    });
  }
}
