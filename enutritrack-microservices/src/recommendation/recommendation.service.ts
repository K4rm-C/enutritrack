import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Recommendation } from './models/recommendation.model';
import { RecommendationType } from './models/tipos_recomendacion.model';
import { RecommendationData } from './models/recomendacion_datos';
import {
  CreateRecommendationDto,
  CreateAIRecommendationDto,
  UpdateRecommendationDto,
  CreateRecommendationTypeDto,
  UpdateRecommendationTypeDto,
} from './dto/create-recommendation.dto';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
    @InjectRepository(RecommendationType)
    private typeRepository: Repository<RecommendationType>,
    @InjectRepository(RecommendationData)
    private dataRepository: Repository<RecommendationData>,
  ) {
    this.genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || 'your-api-key',
    );
  }

  // ========== TIPOS DE RECOMENDACIÓN ==========

  async createType(
    createTypeDto: CreateRecommendationTypeDto,
  ): Promise<RecommendationType> {
    try {
      const type = this.typeRepository.create(createTypeDto);
      return await this.typeRepository.save(type);
    } catch (error) {
      this.logger.error(`Error creating recommendation type: ${error.message}`);
      throw new BadRequestException('Error al crear el tipo de recomendación');
    }
  }

  async findAllTypes(): Promise<RecommendationType[]> {
    return this.typeRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findTypeById(id: string): Promise<RecommendationType> {
    const type = await this.typeRepository.findOne({ where: { id } });
    if (!type) {
      throw new NotFoundException('Tipo de recomendación no encontrado');
    }
    return type;
  }

  async updateType(
    id: string,
    updateTypeDto: UpdateRecommendationTypeDto,
  ): Promise<RecommendationType> {
    const type = await this.findTypeById(id);
    Object.assign(type, updateTypeDto);
    return this.typeRepository.save(type);
  }

  async deleteType(id: string): Promise<void> {
    const result = await this.typeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Tipo de recomendación no encontrado');
    }
  }

  // ========== RECOMENDACIONES ==========

  async create(createDto: CreateRecommendationDto): Promise<Recommendation> {
    try {
      const recommendation = this.recommendationRepository.create(createDto);
      return await this.recommendationRepository.save(recommendation);
    } catch (error) {
      this.logger.error(`Error creating recommendation: ${error.message}`);
      throw new BadRequestException('Error al crear la recomendación');
    }
  }

  async createWithAI(
    createAIDto: CreateAIRecommendationDto,
  ): Promise<Recommendation> {
    try {
      const userData = await this.getUserDataForAI(createAIDto.usuario_id);
      const recommendationType = await this.typeRepository.findOne({
        where: { id: createAIDto.tipo_recomendacion_id },
      });

      if (!recommendationType) {
        throw new NotFoundException('Tipo de recomendación no encontrado');
      }

      const aiContent = await this.generateAIContent(
        recommendationType,
        userData,
        createAIDto.contexto_adicional,
      );

      const recommendation = this.recommendationRepository.create({
        usuario_id: createAIDto.usuario_id,
        tipo_recomendacion_id: createAIDto.tipo_recomendacion_id,
        contenido: aiContent,
        prioridad: createAIDto.prioridad || 'media',
        vigencia_hasta:
          createAIDto.vigencia_hasta ||
          this.calculateDefaultExpiry(recommendationType.nombre),
        activa: true,
      });

      return await this.recommendationRepository.save(recommendation);
    } catch (error) {
      this.logger.error(`Error creating AI recommendation: ${error.message}`);
      return this.createFallbackRecommendation(createAIDto);
    }
  }

  private async generateAIContent(
    type: RecommendationType,
    userData: any,
    additionalContext?: string,
  ): Promise<string> {
    try {
      const prompt = this.buildAIPrompt(type, userData, additionalContext);
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.warn(
        `AI generation failed, using fallback: ${error.message}`,
      );
      return this.getFallbackContent(type, userData);
    }
  }

  private buildAIPrompt(
    type: RecommendationType,
    userData: any,
    additionalContext?: string,
  ): string {
    return `
Eres un asistente médico especializado en ${type.nombre}. 
Genera una recomendación personalizada en español para el paciente.

Datos del paciente:
- Nombre: ${userData.nombre}
- Edad: ${userData.edad}
- Género: ${userData.genero}
- Altura: ${userData.altura} cm
- Peso actual: ${userData.peso_actual} kg
- Objetivo de peso: ${userData.peso_objetivo} kg
- Nivel de actividad: ${userData.nivel_actividad}

${additionalContext ? `Contexto adicional: ${additionalContext}` : ''}

La recomendación debe ser práctica, aplicable y basada en evidencia científica.
`;
  }

  private getFallbackContent(type: RecommendationType, userData: any): string {
    const fallbacks = {
      nutrition: `Recomendación nutricional para ${userData.nombre}:\n\nBasado en tu perfil, te recomiendo mantener una dieta equilibrada...`,
      exercise: `Plan de ejercicio para ${userData.nombre}:\n\nConsiderando tu nivel de actividad, te sugiero...`,
      medical: `Recomendaciones de salud para ${userData.nombre}:\n\nPara mantener tu bienestar...`,
    };
    return fallbacks[type.nombre.toLowerCase()] || fallbacks.medical;
  }

  private async getUserDataForAI(userId: string): Promise<any> {
    return {
      nombre: 'Paciente',
      edad: 35,
      genero: 'No especificado',
      altura: 170,
      peso_actual: 70,
      peso_objetivo: 65,
      nivel_actividad: 'moderado',
    };
  }

  private calculateDefaultExpiry(typeName: string): Date {
    const expiry = new Date();
    const type = typeName.toLowerCase();
    if (type.includes('nutrition')) expiry.setDate(expiry.getDate() + 30);
    else if (type.includes('exercise')) expiry.setDate(expiry.getDate() + 14);
    else if (type.includes('medical')) expiry.setDate(expiry.getDate() + 90);
    else expiry.setDate(expiry.getDate() + 7);
    return expiry;
  }

  private async createFallbackRecommendation(
    createAIDto: CreateAIRecommendationDto,
  ): Promise<Recommendation> {
    const type = await this.typeRepository.findOne({
      where: { id: createAIDto.tipo_recomendacion_id },
    });

    if (!type) {
      throw new NotFoundException('Tipo de recomendación no encontrado');
    }

    const userData = await this.getUserDataForAI(createAIDto.usuario_id);
    const fallbackContent = this.getFallbackContent(type, userData);

    return this.create({
      usuario_id: createAIDto.usuario_id,
      tipo_recomendacion_id: createAIDto.tipo_recomendacion_id,
      contenido: fallbackContent,
      vigencia_hasta:
        createAIDto.vigencia_hasta || this.calculateDefaultExpiry(type.nombre),
      activa: true,
    } as CreateRecommendationDto);
  }

  async findAllByUser(
    userId: string,
    includeInactive: boolean = false,
  ): Promise<Recommendation[]> {
    const where: any = { usuario_id: userId };
    if (!includeInactive) {
      where.activa = true;
      where.vigencia_hasta = MoreThan(new Date());
    }

    return this.recommendationRepository.find({
      where,
      relations: ['tipo_recomendacion', 'datos'],
      order: { fecha_generacion: 'DESC' },
    });
  }

  async findActiveByUser(userId: string): Promise<Recommendation[]> {
    return this.recommendationRepository.find({
      where: {
        usuario_id: userId,
        activa: true,
        vigencia_hasta: MoreThan(new Date()),
      },
      relations: ['tipo_recomendacion', 'datos'],
      order: { fecha_generacion: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Recommendation> {
    const recommendation = await this.recommendationRepository.findOne({
      where: { id },
      relations: ['tipo_recomendacion', 'datos'],
    });

    if (!recommendation) {
      throw new NotFoundException('Recomendación no encontrada');
    }

    return recommendation;
  }

  async update(
    id: string,
    updateDto: UpdateRecommendationDto,
  ): Promise<Recommendation> {
    const recommendation = await this.findOne(id);
    Object.assign(recommendation, updateDto);
    return this.recommendationRepository.save(recommendation);
  }

  async deactivate(id: string): Promise<Recommendation> {
    const recommendation = await this.findOne(id);
    recommendation.activa = false;
    return this.recommendationRepository.save(recommendation);
  }

  async delete(id: string): Promise<void> {
    const result = await this.recommendationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Recomendación no encontrada');
    }
  }

  async getRecommendationTypes(): Promise<RecommendationType[]> {
    return this.typeRepository.find({ order: { nombre: 'ASC' } });
  }

  async addRecommendationData(
    recommendationId: string,
    clave: string,
    valor: string,
    tipo_dato?: string,
  ): Promise<RecommendationData> {
    const data = this.dataRepository.create({
      recomendacion_id: recommendationId,
      clave,
      valor,
      tipo_dato,
    });
    return this.dataRepository.save(data);
  }

  async healthCheck() {
    const startTime = Date.now();
    const uptime = Math.floor((Date.now() - startTime) / 1000);

    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      service: process.env.SERVICE_NAME || 'Microservicio de recomendaciones',
      version: process.env.APP_VERSION || '1.1.0',
    };
  }
}
