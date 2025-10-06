import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { Recommendation } from './models/recommendation.model';
import { RecommendationType } from './models/recommendation.model';
import { User } from '../users/models/user.model';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || 'your-api-key-here',
    );
  }

  async generateRecommendation(
    createRecommendationDto: CreateRecommendationDto,
  ): Promise<Recommendation> {
    try {
      // Generar contenido con IA
      const prompt = this.generatePrompt(
        createRecommendationDto.tipo,
        createRecommendationDto.datosEntrada,
      );
      const geminiResponse = await this.callGeminiApiDirectly(prompt);

      const recommendation = this.recommendationRepository.create({
        ...createRecommendationDto,
        contenido: geminiResponse,
        vigenciaHasta: this.calculateExpiryDate(createRecommendationDto.tipo),
        activa: true,
      });

      const savedRecommendation =
        await this.recommendationRepository.save(recommendation);

      // Invalidar caché del usuario
      await this.cacheManager.del(
        `recommendations:user:${createRecommendationDto.usuarioId}`,
      );
      await this.cacheManager.del(
        `recommendations:active:${createRecommendationDto.usuarioId}:${createRecommendationDto.tipo}`,
      );

      return savedRecommendation;
    } catch (error) {
      this.logger.error('Error generating recommendation:', error);
      throw new HttpException(
        'Failed to generate recommendation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByUser(usuarioId: string): Promise<Recommendation[]> {
    const cacheKey = `recommendations:user:${usuarioId}`;

    try {
      // Verificar caché
      const cached = await this.cacheManager.get<Recommendation[]>(cacheKey);
      if (cached) return cached;

      const recommendations = await this.recommendationRepository.find({
        where: { usuario: { id: usuarioId } },
        order: { fechaGeneracion: 'DESC' },
      });

      // Guardar en caché por 1 hora
      await this.cacheManager.set(cacheKey, recommendations, 3600);

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
    const cacheKey = `recommendations:active:${usuarioId}:${tipo}`;

    try {
      // Verificar caché
      const cached = await this.cacheManager.get<Recommendation[]>(cacheKey);
      if (cached) return cached;

      const recommendations = await this.recommendationRepository.find({
        where: {
          usuario: { id: usuarioId },
          tipo,
          activa: true,
          vigenciaHasta: MoreThan(new Date()),
        },
        order: { fechaGeneracion: 'DESC' },
      });

      // Guardar en caché por 30 minutos
      await this.cacheManager.set(cacheKey, recommendations, 1800);

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
      // Invalidar caché
      await this.cacheManager.del(
        `recommendations:user:${recommendation.usuario.id}`,
      );
      await this.cacheManager.del(
        `recommendations:active:${recommendation.usuario.id}:${recommendation.tipo}`,
      );

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

  // Métodos quick simplificados
  async quickNutritionRecommendation(
    usuarioId: string,
  ): Promise<Recommendation> {
    const quickPrompt = `Genera una recomendación nutricional rápida y práctica en español con:
    1. Calorías diarias recomendadas para un adulto promedio
    2. 3 comidas principales sugeridas para hoy
    3. 2 consejos nutricionales clave
    Máximo 200 palabras.`;

    return this.createQuickRecommendation(
      usuarioId,
      RecommendationType.NUTRITION,
      quickPrompt,
    );
  }

  async quickExerciseRecommendation(
    usuarioId: string,
  ): Promise<Recommendation> {
    const quickPrompt = `Genera una rutina de ejercicio rápida para hoy en español con:
    1. Calentamiento (5 min)
    2. 4-5 ejercicios principales con repeticiones
    3. Enfriamiento (5 min)
    4. Duración total estimada
    Máximo 200 palabras.`;

    return this.createQuickRecommendation(
      usuarioId,
      RecommendationType.EXERCISE,
      quickPrompt,
    );
  }

  async quickMedicalRecommendation(usuarioId: string): Promise<Recommendation> {
    const quickPrompt = `Genera recomendaciones de salud preventiva rápidas en español con:
    1. 2 consejos de salud general
    2. Signos de alerta a observar
    3. Recomendación de chequeo médico
    4. Hábitos saludables diarios
    Máximo 200 palabras. NOTA: Estas son recomendaciones generales, no reemplazan consulta médica.`;

    return this.createQuickRecommendation(
      usuarioId,
      RecommendationType.MEDICAL,
      quickPrompt,
    );
  }

  private async createQuickRecommendation(
    usuarioId: string,
    tipo: RecommendationType,
    prompt: string,
  ): Promise<Recommendation> {
    try {
      const geminiResponse = await this.callGeminiApiDirectly(prompt);

      const recommendation = this.recommendationRepository.create({
        usuario: { id: usuarioId } as User,
        tipo,
        contenido: geminiResponse,
        datosEntrada: { quick: true, timestamp: new Date().toISOString() },
        vigenciaHasta: this.calculateExpiryDate(tipo),
        activa: true,
      });

      return await this.recommendationRepository.save(recommendation);
    } catch (error) {
      this.logger.error(`Error creating quick ${tipo} recommendation:`, error);
      return this.getFallbackRecommendation(usuarioId, tipo);
    }
  }

  private async callGeminiApiDirectly(prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      this.logger.error('Error calling Gemini API:', error);
      return this.getFallbackResponseContent();
    }
  }

  private generatePrompt(
    tipo: RecommendationType,
    datosEspecificos: any = {},
  ): string {
    switch (tipo) {
      case RecommendationType.NUTRITION:
        return `Genera un plan nutricional personalizado basado en: ${JSON.stringify(datosEspecificos)}`;
      case RecommendationType.EXERCISE:
        return `Genera un plan de ejercicios personalizado basado en: ${JSON.stringify(datosEspecificos)}`;
      case RecommendationType.MEDICAL:
        return `Genera recomendaciones médicas generales basadas en: ${JSON.stringify(datosEspecificos)}`;
      default:
        return `Genera una recomendación general de salud y bienestar.`;
    }
  }

  private calculateExpiryDate(tipo: RecommendationType): Date {
    const expiryDate = new Date();
    switch (tipo) {
      case RecommendationType.NUTRITION:
        expiryDate.setDate(expiryDate.getDate() + 30);
        break;
      case RecommendationType.EXERCISE:
        expiryDate.setDate(expiryDate.getDate() + 14);
        break;
      case RecommendationType.MEDICAL:
        expiryDate.setDate(expiryDate.getDate() + 90);
        break;
      default:
        expiryDate.setDate(expiryDate.getDate() + 7);
    }
    return expiryDate;
  }

  private getFallbackResponseContent(): string {
    return `Recomendación de salud personalizada:
1. Mantener una dieta equilibrada con énfasis en alimentos naturales
2. Realizar al menos 30 minutos de actividad física moderada diariamente
3. Mantener una hidratación adecuada (al menos 2 litros de agua al día)
4. Consultar con tu médico para seguimiento regular`;
  }

  private getFallbackRecommendation(
    usuarioId: string,
    tipo: RecommendationType,
  ): Recommendation {
    const recommendation = this.recommendationRepository.create({
      usuario: { id: usuarioId } as User,
      tipo,
      contenido: this.getFallbackResponseContent(),
      datosEntrada: { fallback: true, timestamp: new Date().toISOString() },
      vigenciaHasta: this.calculateExpiryDate(tipo),
      activa: true,
    });

    return recommendation;
  }
}
