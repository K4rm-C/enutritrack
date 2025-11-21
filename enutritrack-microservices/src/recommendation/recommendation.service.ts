import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { GoogleGenAI } from '@google/genai';
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
  private ai: GoogleGenAI;
  private aiEnabled: boolean = false;

  constructor(
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
    @InjectRepository(RecommendationType)
    private typeRepository: Repository<RecommendationType>,
    @InjectRepository(RecommendationData)
    private dataRepository: Repository<RecommendationData>,
  ) {
    const apiKey = 'AIzaSyB7YLSU7l-AwR4Zh-82aQ7oppO8RxDPZg4';
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
      this.aiEnabled = true;
      this.logger.log(
        '✅ IA habilitada - Gemini API configurada con @google/genai',
      );
      this.testAIConnection();
    } else {
      this.logger.warn('❌ IA deshabilitada - GEMINI_API_KEY no configurada');
      this.aiEnabled = false;
    }
  }

  private async testAIConnection(): Promise<void> {
    if (!this.aiEnabled) return;

    try {
      this.logger.log('🧪 Probando conexión con Gemini 2.5 Flash...');

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Responde con 'OK' si la conexión funciona",
      });

      this.logger.log(`✅ Conexión exitosa: ${response.text}`);
    } catch (error) {
      this.logger.error(`❌ Error en conexión: ${error.message}`);
      this.aiEnabled = false;
    }
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
    // Si la IA no está disponible, usar fallback inmediatamente
    if (!this.aiEnabled) {
      this.logger.log('IA no disponible, usando contenido de respaldo');
      return this.getEnhancedFallbackContent(type, userData, additionalContext);
    }

    try {
      const prompt = this.buildAIPrompt(type, userData, additionalContext);

      this.logger.log('🚀 Generando contenido con Gemini 2.5 Flash...');

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      this.logger.log('✅ Contenido generado exitosamente con IA');
      return response.text ?? '';
    } catch (error) {
      this.logger.error(`❌ Error en generación de IA: ${error.message}`);

      // Información detallada para debugging
      if (error.response) {
        this.logger.error(
          `Detalles del error: ${JSON.stringify(error.response.data)}`,
        );
      }

      return this.getEnhancedFallbackContent(type, userData, additionalContext);
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

La recomendación debe ser:
- Práctica y aplicable en la vida diaria
- Basada en evidencia científica
- Personalizada para este paciente específico
- Clara y fácil de entender
- Incluir consejos específicos y medibles
- En español, con un tono profesional pero cercano

Formato de respuesta:
- Comienza con un título descriptivo
- Organiza la información en secciones claras
- Usa emojis relevantes para hacerlo más amigable
- Incluye recomendaciones específicas, horarios si es necesario
- Termina con recordatorios importantes

Genera una recomendación completa y detallada:
`;
  }

  private getEnhancedFallbackContent(
    type: RecommendationType,
    userData: any,
    additionalContext?: string,
  ): string {
    const typeName = type.nombre.toLowerCase();
    const userName = userData.nombre || 'Paciente';
    const age = userData.edad || 'no especificada';
    const weight = userData.peso_actual || 'no especificado';
    const activity = userData.nivel_actividad || 'moderado';

    const templates = {
      nutrición: `
🔸 **RECOMENDACIÓN NUTRICIONAL PERSONALIZADA** 🔸

**Paciente:** ${userName}
**Edad:** ${age} años
**Peso actual:** ${weight} kg
**Nivel de actividad:** ${activity}

📋 **PLAN NUTRICIONAL RECOMENDADO:**

🥗 **Desayuno (7:00 - 8:00 AM):**
- 1 porción de proteína (huevos, yogur griego)
- 1 porción de carbohidratos complejos (avena, pan integral)
- 1 fruta fresca
- Bebida sin azúcar (café, té, agua)

🥗 **Almuerzo (12:00 - 1:00 PM):**
- Ensalada verde con verduras variadas
- 150g de proteína magra (pollo, pescado, legumbres)
- 1 porción de carbohidratos (arroz integral, quinoa)
- 1 cucharada de grasas saludables (aguacate, aceite de oliva)

🥗 **Merienda (4:00 - 5:00 PM):**
- Frutos secos (puñado de almendras o nueces)
- 1 fruta o yogur natural

🥗 **Cena (7:00 - 8:00 PM):**
- Proteína ligera (pescado blanco, tofu)
- Verduras al vapor o salteadas
- Evitar carbohidratos pesados

💧 **Hidratación:**
- 8-10 vasos de agua al día
- Limitar bebidas azucaradas
- Infusiones naturales permitidas

${additionalContext ? `\n⚡ **Consideraciones específicas:** ${additionalContext}` : ''}

🎯 **OBJETIVOS SEMANALES:**
- Mantener horarios consistentes
- Incluir 5 porciones de frutas/verduras diarias
- Limitar alimentos procesados
- Controlar porciones

⚠️ **CONSULTA PROFESIONAL:** Esta recomendación es general. Para un plan personalizado, consulta con un nutricionista.
      `,

      ejercicio: `
🔸 **PLAN DE EJERCICIO PERSONALIZADO** 🔸

**Paciente:** ${userName}
**Edad:** ${age} años
**Nivel de actividad:** ${activity}

🏃 **RUTINA SEMANAL RECOMENDADA:**

**Lunes - Cardio (30-45 minutos):**
- Caminata rápida o trote suave
- Ciclismo estático o natación
- Estiramientos finales

**Martes - Fuerza Superior (25-35 minutos):**
- Flexiones de pecho (3 series x 10-15 repeticiones)
- Fondos de tríceps (3 series x 12 repeticiones)
- Plancha abdominal (3 series x 30 segundos)

**Miércoles - Descanso Activo:**
- Caminata ligera 20 minutos
- Estiramientos suaves
- Movilidad articular

**Jueves - Cardio Intervalo (20-30 minutos):**
- 1 minuto trote rápido + 2 minutos caminata
- Repetir 8-10 veces
- Enfriamiento progresivo

**Viernes - Fuerza Inferior (25-35 minutos):**
- Sentadillas (3 series x 15 repeticiones)
- Zancadas (3 series x 12 por pierna)
- Elevación de talones (3 series x 20 repeticiones)

**Sábado - Actividad Recreativa:**
- Natación, baile o senderismo
- Deporte de preferencia
- 45-60 minutos de disfrute

**Domingo - Descanso Total:**
- Recuperación muscular
- Hidratación adecuada
- Sueño reparador

${additionalContext ? `\n⚡ **Consideraciones específicas:** ${additionalContext}` : ''}

📊 **PARÁMETROS DE CONTROL:**
- Frecuencia cardiaca en zona segura
- Hidratación constante durante ejercicio
- Progresión gradual de intensidad
- Escuchar las señales del cuerpo

⚠️ **PRECAUCIÓN:** Detener actividad ante dolor intenso. Consultar médico antes de iniciar nueva rutina.
      `,

      medical: `
🔸 **RECOMENDACIONES GENERALES DE SALUD** 🔸

**Paciente:** ${userName}
**Edad:** ${age} años

🏥 **CUIDADOS DE SALUD RECOMENDADOS:**

📅 **Control Médico Regular:**
- Chequeo anual completo
- Control de presión arterial mensual
- Exámenes de laboratorio según edad
- Visita al dentista cada 6 meses

💊 **Medicación y Suplementos:**
- Tomar medicamentos según prescripción
- No automedicarse
- Consultar sobre suplementos vitamínicos
- Mantener vacunación al día

🛌 **Hábitos Saludables:**
- Dormir 7-8 horas diarias
- Manejar el estrés con técnicas de relajación
- Mantener actividad social
- Evitar tabaco y limitar alcohol

${additionalContext ? `\n⚡ **Consideraciones específicas:** ${additionalContext}` : ''}

🚨 **SEÑALES DE ALERTA - CONSULTAR MÉDICO:**
- Dolor persistente
- Fiebre alta prolongada
- Cambios repentinos de peso
- Síntomas inusuales o preocupantes

🔍 **PREVENCIÓN:**
- Estilo de vida saludable
- Ejercicio regular
- Alimentación balanceada
- Revisiones periódicas

⚠️ **IMPORTANTE:** Estas son recomendaciones generales. Consulte con su médico para atención personalizada.
      `,
    };

    return templates[typeName] || templates.medical;
  }

  private async getUserDataForAI(userId: string): Promise<any> {
    // En una implementación real, aquí buscarías los datos del usuario en la base de datos
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
    if (type.includes('nutrition') || type.includes('nutrición'))
      expiry.setDate(expiry.getDate() + 30);
    else if (type.includes('exercise') || type.includes('ejercicio'))
      expiry.setDate(expiry.getDate() + 14);
    else if (type.includes('medical') || type.includes('salud'))
      expiry.setDate(expiry.getDate() + 90);
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
    const fallbackContent = this.getEnhancedFallbackContent(
      type,
      userData,
      createAIDto.contexto_adicional,
    );

    return this.create({
      usuario_id: createAIDto.usuario_id,
      tipo_recomendacion_id: createAIDto.tipo_recomendacion_id,
      contenido: fallbackContent,
      prioridad: createAIDto.prioridad || 'media',
      vigencia_hasta:
        createAIDto.vigencia_hasta || this.calculateDefaultExpiry(type.nombre),
      activa: true,
      is_ai_generated: false,
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

  // Nuevo método para diagnóstico de IA
  async healthCheck() {
    const startTime = Date.now();
    const uptime = Math.floor((Date.now() - startTime) / 1000);

    const aiStatus = this.aiEnabled ? 'connected' : 'disabled';

    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      service: process.env.SERVICE_NAME || 'Microservicio de recomendaciones',
      version: process.env.APP_VERSION || '1.2.0',
      ai: {
        status: aiStatus,
        provider: 'Google Gemini',
        model: 'gemini-2.5-flash',
      },
    };
  }

  // Método para probar la IA
  async testAI(): Promise<any> {
    if (!this.aiEnabled) {
      return {
        status: 'disabled',
        message: 'IA no está habilitada. Verifica GEMINI_API_KEY',
      };
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents:
          'Responde con un breve mensaje confirmando que la IA está funcionando correctamente.',
      });

      return {
        status: 'success',
        message: 'Conexión con Gemini 2.5 Flash exitosa',
        response: response.text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
