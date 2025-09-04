import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly RECOMMENDATION_SERVICE_URL = 'http://localhost:3000';
  private genAI: GoogleGenerativeAI;

  constructor(private httpService: HttpService) {
    this.genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || 'AIzaSyCaPPzZwsbpvwuNMgwBYxQnlR9IDw5NMn4',
    );
  }

  async generateRecommendation(
    createRecommendationDto: any,
    authHeader?: string,
  ) {
    try {
      const userData = await this.getUserDataFromServices(
        createRecommendationDto.usuarioId,
        authHeader,
      );
      const prompt = this.generatePrompt(
        createRecommendationDto.tipo,
        userData,
        createRecommendationDto.datosEntrada,
      );
      const geminiResponse = await this.callGeminiApiDirectly(prompt);
      const recommendationData = {
        ...createRecommendationDto,
        contenido: geminiResponse,
        vigenciaHasta: this.calculateExpiryDate(createRecommendationDto.tipo),
        activa: true,
      };
      const headers = authHeader ? { Authorization: authHeader } : {};
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.RECOMMENDATION_SERVICE_URL}/recommendations`,
          recommendationData,
          { headers },
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

  private async getUserDataFromServices(
    userId: string,
    authHeader?: string,
  ): Promise<any> {
    try {
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw new Error(
          `Invalid userId provided: ${JSON.stringify(userId)} (type: ${typeof userId})`,
        );
      }
      const cleanUserId = String(userId).trim();

      // Validar que el cleanUserId sea un UUID válido (formato básico)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const headers = authHeader ? { Authorization: authHeader } : {};
      this.logger.log(
        `Making request to: ${this.RECOMMENDATION_SERVICE_URL}/users/${cleanUserId}`,
      );
      const userResponse = await firstValueFrom(
        this.httpService.get(
          `${this.RECOMMENDATION_SERVICE_URL}/users/${cleanUserId}`,
          {
            headers,
            timeout: 10000,
          },
        ),
      );
      const user = userResponse.data;
      let medicalHistory = {};
      try {
        const medicalHistoryResponse = await firstValueFrom(
          this.httpService.get(
            `${this.RECOMMENDATION_SERVICE_URL}/medical-history/user/${cleanUserId}`,
            {
              headers,
              timeout: 10000,
            },
          ),
        );
        medicalHistory = medicalHistoryResponse.data || {};
      } catch (error) {
        this.logger.warn(
          `Could not fetch medical history for user ${cleanUserId}: ${error.message}`,
        );
      }
      let recentNutrition = [];
      try {
        const nutritionResponse = await firstValueFrom(
          this.httpService.get(
            `${this.RECOMMENDATION_SERVICE_URL}/nutrition/user/${cleanUserId}`,
            {
              headers,
              timeout: 10000,
            },
          ),
        );
        recentNutrition = (nutritionResponse.data || []).slice(0, 7);
      } catch (error) {
        this.logger.warn(
          `Could not fetch nutrition data for user ${cleanUserId}: ${error.message}`,
        );
      }
      let recentActivities = [];
      try {
        const activityResponse = await firstValueFrom(
          this.httpService.get(
            `${this.RECOMMENDATION_SERVICE_URL}/activity/user/${cleanUserId}`,
            {
              headers,
              timeout: 10000,
            },
          ),
        );
        recentActivities = (activityResponse.data || []).slice(0, 7);
      } catch (error) {
        this.logger.warn(
          `Could not fetch activity data for user ${cleanUserId}: ${error.message}`,
        );
      }
      return {
        user: {
          nombre: user.nombre || 'Usuario',
          edad: user.fechaNacimiento
            ? this.calculateAge(user.fechaNacimiento)
            : 30,
          genero: user.genero || 'no especificado',
          altura: user.altura || 170,
          pesoActual: user.pesoActual || 70,
          objetivoPeso: user.objetivoPeso || user.pesoActual || 70,
          nivelActividad: user.nivelActividad || 'moderado',
        },
        medicalHistory,
        recentNutrition,
        recentActivities,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching user data for ${userId}: ${error.message}`,
      );
      return {
        user: {
          nombre: 'Usuario',
          edad: 30,
          genero: 'no especificado',
          altura: 170,
          pesoActual: 70,
          objetivoPeso: 70,
          nivelActividad: 'moderado',
        },
        medicalHistory: {},
        recentNutrition: [],
        recentActivities: [],
      };
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
      return this.getFallbackResponseContent();
    }
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

  private getFallbackResponseContent(): string {
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

  async findByUser(userId: string, authHeader?: string) {
    try {
      const headers = authHeader ? { Authorization: authHeader } : {};

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.RECOMMENDATION_SERVICE_URL}/recommendations/user/${userId}`,
          { headers },
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

  async findActiveByUserAndType(
    userId: string,
    tipo: string,
    authHeader?: string,
  ) {
    try {
      const headers = authHeader ? { Authorization: authHeader } : {};

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.RECOMMENDATION_SERVICE_URL}/recommendations/user/${userId}/${tipo}`,
          { headers },
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

  async deactivate(id: string, authHeader?: string) {
    try {
      const headers = authHeader ? { Authorization: authHeader } : {};

      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.RECOMMENDATION_SERVICE_URL}/recommendations/${id}/deactivate`,
          {},
          { headers },
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
      contenido: this.getFallbackResponseContent(),
      datosEntrada: createRecommendationDto.datosEntrada,
      vigenciaHasta: this.calculateExpiryDate(createRecommendationDto.tipo),
      activa: true,
    };
  }

  async testRecommendationServiceConnection(
    authHeader?: string,
  ): Promise<boolean> {
    try {
      const headers = authHeader ? { Authorization: authHeader } : {};

      await firstValueFrom(
        this.httpService.get(`${this.RECOMMENDATION_SERVICE_URL}/health`, {
          headers,
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

  async quickNutritionRecommendation(
    userId: string,
    authHeader?: string,
  ): Promise<any> {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error(`Invalid userId: ${userId}`);
      }

      this.logger.log(
        `Generating quick nutrition recommendation for user: ${userId}`,
      );

      const userData = await this.getUserDataFromServices(userId, authHeader);

      const quickPrompt = `Eres un nutricionista experto. Basándote en estos datos del usuario: 
      Edad: ${userData.user.edad}, Género: ${userData.user.genero}, Peso: ${userData.user.pesoActual}kg, 
      Altura: ${userData.user.altura}cm, Objetivo: ${userData.user.objetivoPeso}kg, 
      Nivel actividad: ${userData.user.nivelActividad}.
      
      Genera una recomendación nutricional rápida y práctica en español con:
      1. Calorías diarias recomendadas
      2. 3 comidas principales sugeridas para hoy
      3. 2 consejos nutricionales clave
      Máximo 200 palabras.`;

      const geminiResponse = await this.callGeminiApiDirectly(quickPrompt);

      const quickRecommendation = {
        usuarioId: userId,
        tipo: 'nutrition',
        contenido: geminiResponse,
        datosEntrada: { quick: true, timestamp: new Date() },
        vigenciaHasta: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        activa: true,
      };

      return quickRecommendation;
    } catch (error) {
      this.logger.error(
        `Error generating quick nutrition recommendation: ${error.message}`,
      );
      return {
        usuarioId: userId,
        tipo: 'nutrition',
        contenido: `Recomendación nutricional rápida:
        
1. Consume aproximadamente 2000-2200 calorías diarias
2. Desayuno: Avena con frutas y nueces
3. Almuerzo: Ensalada con proteína magra (pollo, pescado)
4. Cena: Vegetales al vapor con quinoa
5. Mantén hidratación constante (2-3 litros de agua)
6. Evita alimentos procesados y azúcares refinados`,
        datosEntrada: { quick: true, fallback: true },
        vigenciaHasta: new Date(Date.now() + 24 * 60 * 60 * 1000),
        activa: true,
      };
    }
  }

  async quickExerciseRecommendation(
    userId: string,
    authHeader?: string,
  ): Promise<any> {
    try {
      // Validar que userId sea un string válido
      if (!userId || typeof userId !== 'string') {
        throw new Error(`Invalid userId: ${userId}`);
      }

      this.logger.log(
        `Generating quick exercise recommendation for user: ${userId}`,
      );

      // Obtener datos básicos del usuario
      const userData = await this.getUserDataFromServices(userId, authHeader);

      // Prompt específico para recomendación rápida de ejercicio
      const quickPrompt = `Eres un entrenador personal experto. Basándote en estos datos del usuario:
      Edad: ${userData.user.edad}, Género: ${userData.user.genero}, Peso: ${userData.user.pesoActual}kg,
      Altura: ${userData.user.altura}cm, Objetivo: ${userData.user.objetivoPeso}kg,
      Nivel actividad: ${userData.user.nivelActividad}.
      
      Genera una rutina de ejercicio rápida para hoy en español con:
      1. Calentamiento (5 min)
      2. 4-5 ejercicios principales con repeticiones
      3. Enfriamiento (5 min)
      4. Duración total estimada
      Máximo 200 palabras.`;

      const geminiResponse = await this.callGeminiApiDirectly(quickPrompt);

      const quickRecommendation = {
        usuarioId: userId,
        tipo: 'exercise',
        contenido: geminiResponse,
        datosEntrada: { quick: true, timestamp: new Date() },
        vigenciaHasta: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        activa: true,
      };

      return quickRecommendation;
    } catch (error) {
      this.logger.error(
        `Error generating quick exercise recommendation: ${error.message}`,
      );
      return {
        usuarioId: userId,
        tipo: 'exercise',
        contenido: `Rutina de ejercicio rápida (30 min):
        
Calentamiento (5 min):
- Marcha en el lugar: 2 min
- Estiramientos dinámicos: 3 min

Ejercicios principales (20 min):
1. Sentadillas: 3 series x 15 rep
2. Flexiones (rodillas si es necesario): 3 series x 10 rep
3. Plancha: 3 series x 30 seg
4. Burpees modificados: 2 series x 8 rep
5. Caminata/trote ligero: 5 min

Enfriamiento (5 min):
- Estiramientos estáticos
- Respiración profunda`,
        datosEntrada: { quick: true, fallback: true },
        vigenciaHasta: new Date(Date.now() + 24 * 60 * 60 * 1000),
        activa: true,
      };
    }
  }

  async quickMedicalRecommendation(
    userId: string,
    authHeader?: string,
  ): Promise<any> {
    try {
      // Validar que userId sea un string válido
      if (!userId || typeof userId !== 'string') {
        throw new Error(`Invalid userId: ${userId}`);
      }

      this.logger.log(
        `Generating quick medical recommendation for user: ${userId}`,
      );

      // Obtener datos básicos del usuario
      const userData = await this.getUserDataFromServices(userId, authHeader);

      // Prompt específico para recomendación médica rápida
      const quickPrompt = `Eres un asistente médico virtual. Basándote en estos datos del usuario:
      Edad: ${userData.user.edad}, Género: ${userData.user.genero}, 
      Historial médico: ${JSON.stringify(userData.medicalHistory)}.
      
      Genera recomendaciones de salud preventiva rápidas en español con:
      1. 2 consejos de salud general
      2. Signos de alerta a observar
      3. Recomendación de chequeo médico
      4. Hábitos saludables diarios
      Máximo 200 palabras. NOTA: Estas son recomendaciones generales, no reemplazan consulta médica.`;

      const geminiResponse = await this.callGeminiApiDirectly(quickPrompt);

      const quickRecommendation = {
        usuarioId: userId,
        tipo: 'medical',
        contenido: `${geminiResponse}\n\n⚠️ IMPORTANTE: Estas son recomendaciones generales. Siempre consulta con tu médico para evaluación personalizada.`,
        datosEntrada: { quick: true, timestamp: new Date() },
        vigenciaHasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        activa: true,
      };

      return quickRecommendation;
    } catch (error) {
      this.logger.error(
        `Error generating quick medical recommendation: ${error.message}`,
      );
      return {
        usuarioId: userId,
        tipo: 'medical',
        contenido: `Recomendaciones de salud preventiva:
        
1. Mantén horarios regulares de sueño (7-8 horas diarias)
2. Realiza chequeos médicos anuales preventivos
3. Controla regularmente presión arterial y peso
4. Mantén vacunas al día según tu edad

Signos de alerta:
- Dolor persistente o inusual
- Cambios súbitos en peso
- Fatiga extrema sin causa
- Cambios en patrones de sueño

Hábitos saludables:
- Hidratación adecuada
- Ejercicio regular
- Alimentación balanceada
- Manejo del estrés

⚠️ IMPORTANTE: Consulta siempre con tu médico para evaluación personalizada.`,
        datosEntrada: { quick: true, fallback: true },
        vigenciaHasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        activa: true,
      };
    }
  }
}
