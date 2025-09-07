import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly RECOMMENDATION_SERVICE_URL = 'http://localhost:3006';
  private genAI: GoogleGenerativeAI;

  constructor(private httpService: HttpService) {
    this.genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || 'AIzaSyCaPPzZwsbpvwuNMgwBYxQnlR9IDw5NMn4',
    );
  }

  async generateRecommendation(
    createRecommendationDto: any,
    authToken: string,
  ) {
    try {
      const userData = await this.getUserDataFromServices(
        createRecommendationDto.usuarioId,
        authToken,
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
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.RECOMMENDATION_SERVICE_URL}/recommendations`,
          recommendationData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          },
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

  async findByUser(userId: string, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.RECOMMENDATION_SERVICE_URL}/recommendations/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          },
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
    authToken: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.RECOMMENDATION_SERVICE_URL}/recommendations/user/${userId}/${tipo}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          },
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

  async deactivate(id: string, authToken?: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.RECOMMENDATION_SERVICE_URL}/recommendations/${id}/deactivate`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          },
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
    authToken?: string,
  ): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.RECOMMENDATION_SERVICE_URL}/health`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
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

  // Agregar este método privado para guardar recomendaciones
  // Método mejorado con debug logging
  // En RecommendationService - Corregir el formato del token
  private async saveRecommendation(
    recommendationData: any,
    authHeader?: string,
  ): Promise<any> {
    try {
      this.logger.debug('=== SAVING RECOMMENDATION DEBUG ===');
      this.logger.debug(
        `URL: ${this.RECOMMENDATION_SERVICE_URL}/recommendations`,
      );
      let headers = {};
      if (authHeader) {
        const token = authHeader.startsWith('Bearer ')
          ? authHeader
          : `Bearer ${authHeader}`;

        headers = { Authorization: token };
      }

      this.logger.debug('Auth Header original:', authHeader);
      this.logger.debug('Headers formatted:', JSON.stringify(headers, null, 2));
      this.logger.debug(
        'Recommendation Data:',
        JSON.stringify(recommendationData, null, 2),
      );

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.RECOMMENDATION_SERVICE_URL}/recommendations`,
          recommendationData,
          {
            headers,
            timeout: 10000,
          },
        ),
      );

      this.logger.debug(
        'Success Response:',
        JSON.stringify(response.data, null, 2),
      );
      return response.data;
    } catch (error) {
      this.logger.error('=== SAVE RECOMMENDATION ERROR ===');
      this.logger.error(`Error message: ${error.message}`);
      this.logger.error(`Error status: ${error.response?.status}`);
      this.logger.error(
        `Error data:`,
        JSON.stringify(error.response?.data, null, 2),
      );

      // Si es error 401, intentar diferentes formatos de token
      if (error.response?.status === 401 && authHeader) {
        this.logger.warn('=== TRYING ALTERNATIVE TOKEN FORMATS ===');

        // Intentar con Bearer prefix si no lo tiene
        if (!authHeader.startsWith('Bearer ')) {
          try {
            const alternativeHeaders = {
              Authorization: `Bearer ${authHeader}`,
            };
            this.logger.debug('Trying Bearer format:', alternativeHeaders);

            const retryResponse = await firstValueFrom(
              this.httpService.post(
                `${this.RECOMMENDATION_SERVICE_URL}/recommendations`,
                recommendationData,
                {
                  headers: alternativeHeaders,
                  timeout: 10000,
                },
              ),
            );

            this.logger.debug('SUCCESS with Bearer format!');
            return retryResponse.data;
          } catch (retryError) {
            this.logger.error(
              'Bearer format also failed:',
              retryError.response?.data,
            );
          }
        }

        // Intentar sin Bearer prefix si lo tiene
        if (authHeader.startsWith('Bearer ')) {
          try {
            const tokenOnly = authHeader.replace('Bearer ', '');
            const alternativeHeaders = { Authorization: tokenOnly };
            this.logger.debug('Trying token only format:', alternativeHeaders);

            const retryResponse = await firstValueFrom(
              this.httpService.post(
                `${this.RECOMMENDATION_SERVICE_URL}/recommendations`,
                recommendationData,
                {
                  headers: alternativeHeaders,
                  timeout: 10000,
                },
              ),
            );

            this.logger.debug('SUCCESS with token only format!');
            return retryResponse.data;
          } catch (retryError) {
            this.logger.error(
              'Token only format also failed:',
              retryError.response?.data,
            );
          }
        }
      }

      // Si todos los formatos fallan, devolver la recomendación sin guardar
      this.logger.error(
        'All token formats failed, returning unsaved recommendation',
      );
      return recommendationData;
    }
  }
  // También agregar logging en los métodos quick:
  async quickNutritionRecommendation(
    userId: string,
    authHeader?: string,
  ): Promise<any> {
    this.logger.debug(`=== QUICK NUTRITION RECOMMENDATION START ===`);
    this.logger.debug(`UserId: ${userId}`);
    this.logger.debug(`AuthHeader present: ${!!authHeader}`);

    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error(`Invalid userId: ${userId}`);
      }

      const userData = await this.getUserDataFromServices(userId, authHeader);
      this.logger.debug(
        'User data retrieved:',
        JSON.stringify(userData, null, 2),
      );

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
      this.logger.debug('Gemini response length:', geminiResponse.length);

      // VALIDAR DATOS ANTES DE ENVIAR
      const quickRecommendation = {
        usuarioId: String(userId).trim(), // Asegurar que sea string limpio
        tipo: 'nutrition',
        datosEntrada: {
          quick: true,
          timestamp: new Date().toISOString(), // Usar ISO string
        },
      };

      this.logger.debug(
        'Quick recommendation object created:',
        JSON.stringify(quickRecommendation, null, 2),
      );

      // VALIDACIONES ANTES DE GUARDAR
      if (!quickRecommendation.usuarioId) {
        throw new Error('usuarioId is required');
      }
      if (!quickRecommendation.tipo) {
        throw new Error('tipo is required');
      }

      const savedRecommendation = await this.saveRecommendation(
        quickRecommendation,
        authHeader,
      );

      this.logger.debug('=== QUICK NUTRITION RECOMMENDATION SUCCESS ===');
      return savedRecommendation;
    } catch (error) {
      this.logger.error(`=== QUICK NUTRITION RECOMMENDATION ERROR ===`);
      this.logger.error(`Error: ${error.message}`);
      this.logger.error(`Stack: ${error.stack}`);

      // Fallback con los mismos campos validados
      const fallbackRecommendation = {
        usuarioId: String(userId).trim(),
        tipo: 'nutrition',
        contenido: `Recomendación nutricional rápida:
      
1. Consume aproximadamente 2000-2200 calorías diarias
2. Desayuno: Avena con frutas y nueces
3. Almuerzo: Ensalada con proteína magra (pollo, pescado)
4. Cena: Vegetales al vapor con quinoa
5. Mantén hidratación constante (2-3 litros de agua)
6. Evita alimentos procesados y azúcares refinados`,
        datosEntrada: {
          quick: true,
          fallback: true,
          timestamp: new Date().toISOString(),
        },
        vigenciaHasta: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        activa: true,
      };

      const savedFallback = await this.saveRecommendation(
        fallbackRecommendation,
        authHeader,
      );

      return savedFallback;
    }
  }

  async quickExerciseRecommendation(
    userId: string,
    authToken: string,
  ): Promise<any> {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error(`Invalid userId: ${userId}`);
      }
      const userData = await this.getUserDataFromServices(userId, authToken);
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
      this.logger.debug('Gemini response length:', geminiResponse.length);

      const quickRecommendation = {
        usuarioId: String(userId).trim(), // Asegurar que sea string limpio
        tipo: 'exercise',
        datosEntrada: {
          quick: true,
          timestamp: new Date().toISOString(), // Usar ISO string
        },
      };

      // GUARDAR LA RECOMENDACIÓN EN LA BASE DE DATOS
      const savedRecommendation = await this.saveRecommendation(
        quickRecommendation,
        authToken,
      );

      return savedRecommendation;
    } catch (error) {
      this.logger.error(
        `Error generating quick exercise recommendation: ${error.message}`,
      );

      const fallbackRecommendation = {
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

      const savedFallback = await this.saveRecommendation(
        fallbackRecommendation,
        authToken,
      );

      return savedFallback;
    }
  }

  async quickMedicalRecommendation(
    userId: string,
    authToken: string,
  ): Promise<any> {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error(`Invalid userId: ${userId}`);
      }
      const userData = await this.getUserDataFromServices(userId, authToken);
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
      this.logger.debug('Gemini response length:', geminiResponse.length);

      const quickRecommendation = {
        usuarioId: String(userId).trim(), // Asegurar que sea string limpio
        tipo: 'medical',
        datosEntrada: {
          quick: true,
          timestamp: new Date().toISOString(), // Usar ISO string
        },
      };
      // GUARDAR LA RECOMENDACIÓN EN LA BASE DE DATOS
      const savedRecommendation = await this.saveRecommendation(
        quickRecommendation,
        authToken,
      );

      return savedRecommendation;
    } catch (error) {
      this.logger.error(
        `Error generating quick medical recommendation: ${error.message}`,
      );

      const fallbackRecommendation = {
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

      const savedFallback = await this.saveRecommendation(
        fallbackRecommendation,
        authToken,
      );

      return savedFallback;
    }
  }
}
