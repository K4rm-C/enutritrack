import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Recommendation,
  RecommendationType,
} from './models/recommendation.model';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
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
    // Inicializar Gemini AI con tu API key (debería estar en variables de entorno)
    this.genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || 'AIzaSyCaPPzZwsbpvwuNMgwBYxQnlR9IDw5NMn4',
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
        throw new NotFoundException('Usuario no encontrado');
      }

      const userData = await this.getUserData(
        createRecommendationDto.usuarioId,
      );
      const prompt = this.generatePrompt(
        createRecommendationDto.tipo,
        userData,
        createRecommendationDto.datosEntrada,
      );

      // Usar la API REST directamente en lugar del SDK
      const geminiResponse = await this.callGeminiApiDirectly(prompt);

      const recommendation = this.recommendationRepository.create({
        usuario: user,
        tipo: createRecommendationDto.tipo,
        contenido: geminiResponse,
        datosEntrada: createRecommendationDto.datosEntrada,
        vigenciaHasta: this.calculateExpiryDate(createRecommendationDto.tipo),
        activa: true,
      });

      const savedRecommendation =
        await this.recommendationRepository.save(recommendation);
      this.logger.log(
        `Recommendation created with ID: ${savedRecommendation.id}`,
      );
      return savedRecommendation;
    } catch (error) {
      this.logger.error(`Error generating recommendation: ${error.message}`);
      // En caso de error, devolver una recomendación por defecto
      return this.createFallbackRecommendation(createRecommendationDto);
    }
  }

  private async callGeminiApiDirectly(prompt: string): Promise<string> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY || 'AIzaSyCaPPzZwsbpvwuNMgwBYxQnlR9IDw5NMn4'}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      this.logger.error(`Error calling Gemini API: ${error.message}`);
      return this.getFallbackResponse();
    }
  }

  private async createFallbackRecommendation(
    createRecommendationDto: CreateRecommendationDto,
  ): Promise<Recommendation> {
    const user = await this.userService.findById(
      createRecommendationDto.usuarioId,
    );

    const recommendation = this.recommendationRepository.create({
      usuario: user,
      tipo: createRecommendationDto.tipo,
      contenido: this.getFallbackResponse(),
      datosEntrada: createRecommendationDto.datosEntrada,
      vigenciaHasta: this.calculateExpiryDate(createRecommendationDto.tipo),
      activa: true,
    });

    return this.recommendationRepository.save(recommendation);
  }

  private async getUserData(userId: string): Promise<any> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Obtener peso actual del ultimo registro en historial_peso
    const pesoActual =
      user.historialPeso && user.historialPeso.length > 0
        ? user.historialPeso[0].peso
        : null;

    // Obtener objetivo y nivel de actividad del objetivo mas reciente vigente
    const objetivoVigente = user.objetivos?.find((obj) => obj.vigente === true);
    const objetivoPeso = objetivoVigente?.peso_objetivo || null;
    const nivelActividad = objetivoVigente?.nivel_actividad || null;

    return {
      user: {
        nombre: user.nombre,
        edad: this.calculateAge(user.fecha_nacimiento),
        genero: user.genero,
        altura: user.altura,
        pesoActual: pesoActual,
        objetivoPeso: objetivoPeso,
        nivelActividad: nivelActividad,
      },
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
