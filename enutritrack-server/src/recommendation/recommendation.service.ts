// src/recommendation/recommendation.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Recommendation,
  RecommendationType,
} from './models/recommendation.model';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UserService } from '../users/users.service';
import { MedicalHistoryService } from '../medical-history/medical-history.service';
import { NutritionService } from '../nutrition/nutrition.service';
import { PhysicalActivityService } from '../activity/activity.service';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
    private userService: UserService,
    private medicalHistoryService: MedicalHistoryService,
    private nutritionService: NutritionService,
    private physicalActivityService: PhysicalActivityService,
  ) {
    this.genAI = new GoogleGenerativeAI(
      'AIzaSyCaPPzZwsbpvwuNMgwBYxQnlR9IDw5NMn4',
    );
  }

  async generateRecommendation(
    createRecommendationDto: CreateRecommendationDto,
  ): Promise<Recommendation> {
    try {
      const user = await this.userService.findById(
        createRecommendationDto.usuarioId,
      );
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Obtener datos del usuario para el prompt
      const userData = await this.getUserData(
        createRecommendationDto.usuarioId,
      );

      // Generar prompt según el tipo de recomendación
      const prompt = this.generatePrompt(
        createRecommendationDto.tipo,
        userData,
        createRecommendationDto.datosEntrada,
      );

      // Generar recomendación con Gemini AI
      const geminiResponse = await this.generateWithGemini(prompt);

      // Guardar la recomendación en la base de datos
      const recommendation = this.recommendationRepository.create({
        usuario: user,
        tipo: createRecommendationDto.tipo,
        contenido: geminiResponse,
        datosEntrada: createRecommendationDto.datosEntrada,
        vigenciaHasta: this.calculateExpiryDate(createRecommendationDto.tipo),
      });

      return await this.recommendationRepository.save(recommendation);
    } catch (error) {
      this.logger.error(`Error generating recommendation: ${error.message}`);
      throw new Error(`Error generating recommendation: ${error.message}`);
    }
  }

  private async getUserData(userId: string): Promise<any> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const medicalHistory = await this.medicalHistoryService.findByUser(userId);
    const recentNutrition = await this.nutritionService.findAllByUser(userId);
    const recentActivities =
      await this.physicalActivityService.findAllByUser(userId);
    return {
      user: {
        nombre: user.nombre,
        edad: this.calculateAge(user.fechaNacimiento),
        genero: user.genero,
        altura: user.altura,
        pesoActual: user.pesoActual,
        objetivoPeso: user.objetivoPeso,
        nivelActividad: user.nivelActividad,
      },
      medicalHistory,
      recentNutrition: recentNutrition.slice(0, 7),
      recentActivities: recentActivities.slice(0, 7),
    };
  }

  private calculateAge(fechaNacimiento: Date): number {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  private generatePrompt(
    tipo: string,
    userData: any,
    datosEspecificos: any = {},
  ): string {
    const basePrompt = `Eres un asistente de salud especializado en nutrición y actividad física. 
    Genera una recomendación personalizada en español basada en los siguientes datos del usuario: 
    ${JSON.stringify(userData, null, 2)}.`;

    switch (tipo) {
      case 'nutrition':
        return `${basePrompt}
        Genera un plan nutricional personalizado para este usuario. Incluye:
        1. Recomendaciones calóricas diarias
        2. Distribución de macronutrientes
        3. Ejemplos de comidas para un día
        4. Alimentos recomendados y alimentos a evitar
        5. Consejos específicos basados en su historial médico: ${JSON.stringify(userData.medicalHistory)}`;

      case 'exercise':
        return `${basePrompt}
        Genera un plan de ejercicios personalizado para este usuario. Incluye:
        1. Tipo de ejercicios recomendados
        2. Frecuencia y duración
        3. Intensidad recomendada
        4. Precauciones basadas en su historial médico: ${JSON.stringify(userData.medicalHistory)}
        5. Objetivos específicos basados en sus metas: ${userData.user.objetivoPeso}`;

      case 'medical':
        return `${basePrompt}
        Genera recomendaciones para mejorar su historial médico. Incluye:
        1. Consejos para manejar sus condiciones: ${JSON.stringify(userData.medicalHistory.condiciones)}
        2. Precauciones con sus alergias: ${JSON.stringify(userData.medicalHistory.alergias)}
        3. Recomendaciones sobre sus medicamentos: ${JSON.stringify(userData.medicalHistory.medicamentos)}
        4. Señales de alerta a observar
        5. Recomendaciones de seguimiento médico`;

      case 'general':
      default:
        return `${basePrompt}
        Genera una recomendación general de salud y bienestar que integre nutrición, ejercicio y aspectos médicos.
        Incluye consejos prácticos y realizables para mejorar su calidad de vida.`;
    }
  }

  private async generateWithGemini(prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error(`Error with Gemini AI: ${error.message}`);
      // Respuesta de respaldo en caso de error
      return this.getFallbackResponse();
    }
  }

  private getFallbackResponse(): string {
    return `Recomendación de salud personalizada:

Basado en tu perfil, te recomiendo:
1. Mantener una dieta equilibrada con énfasis en alimentos naturales
2. Realizar al menos 30 minutos de actividad física moderada diariamente
3. Mantener una hidratación adecuada (al menos 2 litros de agua al día)
4. Consultar con tu médico para seguimiento regular de tus condiciones

Para recomendaciones más específicas, por favor contacta a nuestro equipo de especialistas.`;
  }

  private calculateExpiryDate(tipo: string): Date {
    const expiryDate = new Date();

    switch (tipo) {
      case 'nutrition':
        expiryDate.setDate(expiryDate.getDate() + 30); // 1 mes para nutrición
        break;
      case 'exercise':
        expiryDate.setDate(expiryDate.getDate() + 14); // 2 semanas para ejercicio
        break;
      case 'medical':
        expiryDate.setDate(expiryDate.getDate() + 90); // 3 meses para recomendaciones médicas
        break;
      default:
        expiryDate.setDate(expiryDate.getDate() + 7); // 1 semana para recomendaciones generales
    }

    return expiryDate;
  }

  async deactivate(id: string): Promise<void> {
    await this.recommendationRepository.update(id, { activa: false });
  }

  async findByUser(userId: string): Promise<Recommendation[]> {
    return this.recommendationRepository.find({
      where: { usuario: { id: userId }, activa: true },
      order: { fechaGeneracion: 'DESC' },
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
        tipo, // Now tipo is of type RecommendationType
        activa: true,
        vigenciaHasta: MoreThan(now),
      },
      order: { fechaGeneracion: 'DESC' },
    });
  }
}
