import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly RECOMMENDATION_SERVICE_URL = 'http://localhost:3000';

  constructor(private httpService: HttpService) {}

  async generateRecommendation(createRecommendationDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.RECOMMENDATION_SERVICE_URL}/recommendations`,
          createRecommendationDto,
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error calling recommendation service: ${error.message}`,
      );
      return this.getFallbackRecommendation(createRecommendationDto);
    }
  }

  async findByUser(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.RECOMMENDATION_SERVICE_URL}/recommendations/user/${userId}`,
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error fetching user recommendations: ${error.message}`,
      );
      return [];
    }
  }

  async findActiveByUserAndType(userId: string, tipo: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.RECOMMENDATION_SERVICE_URL}/recommendations/user/${userId}/${tipo}`,
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error fetching active recommendations: ${error.message}`,
      );
      return [];
    }
  }

  async deactivate(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.RECOMMENDATION_SERVICE_URL}/recommendations/${id}/deactivate`,
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error deactivating recommendation: ${error.message}`);
      throw error;
    }
  }

  private getFallbackRecommendation(createRecommendationDto: any) {
    return {
      usuarioId: createRecommendationDto.usuarioId,
      tipo: createRecommendationDto.tipo,
      contenido: `Recomendación de salud personalizada:

Basado en tu perfil, te recomiendo:
1. Mantener una dieta equilibrada
2. Realizar actividad física regular
3. Mantener hidratación adecuada
4. Consultar con tu médico regularmente`,
      datosEntrada: createRecommendationDto.datosEntrada,
      vigenciaHasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      activa: true,
    };
  }

  async testRecommendationServiceConnection(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.RECOMMENDATION_SERVICE_URL}/health`, {
          timeout: 5000,
        }),
      );
      return true;
    } catch (error) {
      this.logger.error(
        'Recommendation service connection test failed:',
        error,
      );
      return false;
    }
  }
}
