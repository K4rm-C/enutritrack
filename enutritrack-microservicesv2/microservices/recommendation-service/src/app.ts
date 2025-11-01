// microservices/recommendation-service/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from '../../../shared/database/postgres';
import { authenticateToken } from '../../../shared/middleware/auth';
import { ResponseHandler } from '../../../shared/utils/response';
import { Recomendacion } from '../../../shared/entities/Recomendacion';
import { TipoRecomendacion } from '../../../shared/entities/TipoRecomendacion';
import { RecomendacionDato } from '../../../shared/entities/RecomendacionDato';
import { PerfilUsuario } from '../../../shared/entities/PerfilUsuario';
import { ActividadFisica } from '../../../shared/entities/ActividadFisica';
import { RegistroComida } from '../../../shared/entities/RegistroComida';
import { HistorialPeso } from '../../../shared/entities/HistorialPeso';

const app = express();
const PORT = process.env.PORT || 3009;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
    const dbHealth = await AppDataSource.query('SELECT 1').then(() => true).catch(() => false);
    res.json({ 
        status: 'OK', 
        service: 'recommendation-service',
        database: dbHealth ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Recomendaciones del paciente
app.get('/api/recommendations/patient', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { activas, tipo, prioridad, page = 1, limit = 10 } = req.query;
        
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        
        const recomendacionRepo = AppDataSource.getRepository(Recomendacion);
        let queryBuilder = recomendacionRepo
            .createQueryBuilder('recomendacion')
            .leftJoinAndSelect('recomendacion.tipoRecomendacion', 'tipoRecomendacion')
            .leftJoinAndSelect('recomendacion.datos', 'datos')
            .where('recomendacion.usuarioId = :patientId', { patientId });

        // Filtrar por estado activo
        if (activas !== undefined) {
            const filterActivas = activas === 'true';
            queryBuilder = queryBuilder.andWhere('recomendacion.activa = :activa', { 
                activa: filterActivas 
            });
        }

        // Filtrar por tipo
        if (tipo) {
            queryBuilder = queryBuilder.andWhere('recomendacion.tipoRecomendacionId = :tipo', {
                tipo: tipo
            });
        }

        // Filtrar por prioridad
        if (prioridad) {
            queryBuilder = queryBuilder.andWhere('recomendacion.prioridad = :prioridad', {
                prioridad: prioridad
            });
        }

        const [recomendaciones, total] = await queryBuilder
            .orderBy('recomendacion.fechaGeneracion', 'DESC')
            .skip(skip)
            .take(parseInt(limit as string))
            .getManyAndCount();

        const recomendacionesResponse = recomendaciones.map(recomendacion => ({
            id: recomendacion.id,
            contenido: recomendacion.contenido,
            fecha_generacion: recomendacion.fechaGeneracion,
            vigencia_hasta: recomendacion.vigenciaHasta,
            activa: recomendacion.activa,
            prioridad: recomendacion.prioridad,
            tipo_recomendacion: recomendacion.tipoRecomendacion ? {
                id: recomendacion.tipoRecomendacion.id,
                nombre: recomendacion.tipoRecomendacion.nombre,
                descripcion: recomendacion.tipoRecomendacion.descripcion,
                categoria: recomendacion.tipoRecomendacion.categoria
            } : null,
            datos: recomendacion.datos?.map(dato => ({
                id: dato.id,
                clave: dato.clave,
                valor: dato.valor,
                tipo_dato: dato.tipoDato,
                created_at: dato.createdAt
            })),
            created_at: recomendacion.createdAt
        }));

        ResponseHandler.paginated(res, recomendacionesResponse, parseInt(page as string), parseInt(limit as string), total);

    } catch (error) {
        console.error('Error getting patient recommendations:', error);
        ResponseHandler.internalError(res, 'Error obteniendo las recomendaciones');
    }
});

// Recomendaciones del doctor para paciente
app.get('/api/doctor/patients/:patientId/recommendations', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;

        // Verificar que el paciente pertenece al doctor
        const usuarioRepo = AppDataSource.getRepository(PerfilUsuario);
        const paciente = await usuarioRepo.findOne({
            where: { 
                id: patientId,
                doctorId: doctorId
            }
        });

        if (!paciente) {
            return ResponseHandler.forbidden(res, 'No tiene acceso a este paciente');
        }

        const recomendacionRepo = AppDataSource.getRepository(Recomendacion);
        const recomendaciones = await recomendacionRepo.find({
            where: { usuarioId: patientId },
            relations: ['tipoRecomendacion'],
            order: { fechaGeneracion: 'DESC' }
        });

        const recomendacionesResponse = recomendaciones.map(recomendacion => ({
            id: recomendacion.id,
            contenido: recomendacion.contenido,
            fecha_generacion: recomendacion.fechaGeneracion,
            vigencia_hasta: recomendacion.vigenciaHasta,
            activa: recomendacion.activa,
            prioridad: recomendacion.prioridad,
            tipo_recomendacion: recomendacion.tipoRecomendacion ? {
                id: recomendacion.tipoRecomendacion.id,
                nombre: recomendacion.tipoRecomendacion.nombre,
                descripcion: recomendacion.tipoRecomendacion.descripcion,
                categoria: recomendacion.tipoRecomendacion.categoria
            } : null,
            created_at: recomendacion.createdAt
        }));

        ResponseHandler.success(res, recomendacionesResponse, 'Recomendaciones obtenidas exitosamente');

    } catch (error) {
        console.error('Error getting doctor recommendations:', error);
        ResponseHandler.internalError(res, 'Error obteniendo las recomendaciones');
    }
});

// Crear recomendación (doctor)
app.post('/api/doctor/recommendations', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const doctorId = req.user.id;
        const { usuario_id, tipo_recomendacion_id, contenido, vigencia_hasta, prioridad, cita_medica_id, alerta_generadora_id, datos } = req.body;

        // Validar campos requeridos
        if (!usuario_id || !tipo_recomendacion_id || !contenido) {
            return ResponseHandler.internalError(res, 'Usuario, tipo de recomendación y contenido son requeridos');
        }

        // Verificar que el paciente pertenece al doctor
        const usuarioRepo = AppDataSource.getRepository(PerfilUsuario);
        const paciente = await usuarioRepo.findOne({
            where: { 
                id: usuario_id,
                doctorId: doctorId
            }
        });

        if (!paciente) {
            return ResponseHandler.forbidden(res, 'No tiene acceso a este paciente');
        }

        const recomendacionRepo = AppDataSource.getRepository(Recomendacion);
        const datoRepo = AppDataSource.getRepository(RecomendacionDato);
        
        // Crear nueva recomendación
        const nuevaRecomendacion = new Recomendacion();
        nuevaRecomendacion.usuarioId = usuario_id;
        nuevaRecomendacion.tipoRecomendacionId = tipo_recomendacion_id;
        nuevaRecomendacion.contenido = contenido;
        nuevaRecomendacion.vigenciaHasta = vigencia_hasta ? new Date(vigencia_hasta) : undefined;
        nuevaRecomendacion.prioridad = prioridad || 'media';
        nuevaRecomendacion.citaMedicaId = cita_medica_id || undefined;
        nuevaRecomendacion.alertaGeneradoraId = alerta_generadora_id || undefined;
        nuevaRecomendacion.activa = true;

        const recomendacionGuardada = await recomendacionRepo.save(nuevaRecomendacion);

        // Agregar datos adicionales si se proporcionan
        if (datos && Array.isArray(datos)) {
            for (const dato of datos) {
                const nuevoDato = new RecomendacionDato();
                nuevoDato.recomendacionId = recomendacionGuardada.id;
                nuevoDato.clave = dato.clave;
                nuevoDato.valor = dato.valor;
                nuevoDato.tipoDato = dato.tipo_dato || 'texto';
                
                await datoRepo.save(nuevoDato);
            }
        }

        // Obtener recomendación con relaciones para la respuesta
        const recomendacionCompleta = await recomendacionRepo.findOne({
            where: { id: recomendacionGuardada.id },
            relations: ['tipoRecomendacion', 'datos']
        });

        const responseData = {
            id: recomendacionCompleta!.id,
            contenido: recomendacionCompleta!.contenido,
            fecha_generacion: recomendacionCompleta!.fechaGeneracion,
            vigencia_hasta: recomendacionCompleta!.vigenciaHasta,
            activa: recomendacionCompleta!.activa,
            prioridad: recomendacionCompleta!.prioridad,
            tipo_recomendacion: recomendacionCompleta!.tipoRecomendacion ? {
                id: recomendacionCompleta!.tipoRecomendacion.id,
                nombre: recomendacionCompleta!.tipoRecomendacion.nombre
            } : null,
            datos: recomendacionCompleta!.datos?.map(dato => ({
                id: dato.id,
                clave: dato.clave,
                valor: dato.valor,
                tipo_dato: dato.tipoDato
            })),
            created_at: recomendacionCompleta!.createdAt
        };

        ResponseHandler.created(res, responseData, 'Recomendación creada exitosamente');

    } catch (error) {
        console.error('Error creating recommendation:', error);
        ResponseHandler.internalError(res, 'Error creando la recomendación');
    }
});

// Crear recomendación de IA
app.post('/api/ai/recommendations', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const contextData = req.body;

        // Obtener datos del paciente para contexto
        const usuarioRepo = AppDataSource.getRepository(PerfilUsuario);
        const actividadRepo = AppDataSource.getRepository(ActividadFisica);
        const comidaRepo = AppDataSource.getRepository(RegistroComida);
        const pesoRepo = AppDataSource.getRepository(HistorialPeso);

        const [patient, recentActivities, nutritionData, weightHistory] = await Promise.all([
            usuarioRepo.findOne({ where: { id: patientId } }),
            actividadRepo.find({ 
                where: { usuarioId: patientId },
                order: { fecha: 'DESC' },
                take: 10 
            }),
            comidaRepo.find({
                where: { usuarioId: patientId },
                order: { fecha: 'DESC' },
                take: 10,
                relations: ['items']
            }),
            pesoRepo.find({
                where: { usuarioId: patientId },
                order: { fechaRegistro: 'DESC' },
                take: 5
            })
        ]);

        // Generar recomendación por IA
        const aiRecommendation = await generateAIRecommendation({
            patient,
            recentActivities,
            nutritionData,
            weightHistory,
            context: contextData
        });

        const recomendacionRepo = AppDataSource.getRepository(Recomendacion);
        
        const nuevaRecomendacion = new Recomendacion();
        nuevaRecomendacion.usuarioId = patientId;
        nuevaRecomendacion.tipoRecomendacionId = 'ai_generated'; // Asumiendo que existe este tipo
        nuevaRecomendacion.contenido = aiRecommendation.contenido;
        nuevaRecomendacion.vigenciaHasta = new Date(aiRecommendation.vigencia_hasta);
        nuevaRecomendacion.prioridad = aiRecommendation.prioridad;
        nuevaRecomendacion.activa = true;

        const recomendacionGuardada = await recomendacionRepo.save(nuevaRecomendacion);

        const responseData = {
            id: recomendacionGuardada.id,
            contenido: recomendacionGuardada.contenido,
            fecha_generacion: recomendacionGuardada.fechaGeneracion,
            vigencia_hasta: recomendacionGuardada.vigenciaHasta,
            activa: recomendacionGuardada.activa,
            prioridad: recomendacionGuardada.prioridad,
            created_at: recomendacionGuardada.createdAt
        };

        ResponseHandler.created(res, responseData, 'Recomendación de IA generada exitosamente');

    } catch (error) {
        console.error('Error generating AI recommendation:', error);
        ResponseHandler.internalError(res, 'Error generando la recomendación de IA');
    }
});

// Marcar recomendación como completada
app.put('/api/recommendations/:recommendationId/complete', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { recommendationId } = req.params;
        const { feedback } = req.body;
        const patientId = req.user.id;

        const recomendacionRepo = AppDataSource.getRepository(Recomendacion);
        
        const recomendacion = await recomendacionRepo.findOne({
            where: { 
                id: recommendationId,
                usuarioId: patientId 
            }
        });

        if (!recomendacion) {
            return ResponseHandler.notFound(res, 'Recomendación no encontrada');
        }

        // Actualizar recomendación
        recomendacion.activa = false;
        // Nota: Si necesitas guardar feedback, necesitarías agregar un campo en la entidad
        await recomendacionRepo.save(recomendacion);

        ResponseHandler.success(res, null, 'Recomendación marcada como completada');

    } catch (error) {
        console.error('Error completing recommendation:', error);
        ResponseHandler.internalError(res, 'Error completando la recomendación');
    }
});

// Datos de recomendación
app.get('/api/recommendations/:recommendationId/data', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { recommendationId } = req.params;
        const userId = req.user.id;
        const userType = req.user.tipo;

        const recomendacionRepo = AppDataSource.getRepository(Recomendacion);
        const datoRepo = AppDataSource.getRepository(RecomendacionDato);

        const recomendacion = await recomendacionRepo.findOne({
            where: { id: recommendationId }
        });

        if (!recomendacion) {
            return ResponseHandler.notFound(res, 'Recomendación no encontrada');
        }

        // Verificar permisos
        if (recomendacion.usuarioId !== userId && userType !== 'doctor') {
            return ResponseHandler.forbidden(res, 'No tiene acceso a esta recomendación');
        }

        const datos = await datoRepo.find({
            where: { recomendacionId: recommendationId }
        });

        const datosResponse = datos.map(dato => ({
            id: dato.id,
            clave: dato.clave,
            valor: dato.valor,
            tipo_dato: dato.tipoDato,
            created_at: dato.createdAt
        }));

        ResponseHandler.success(res, datosResponse, 'Datos de recomendación obtenidos exitosamente');

    } catch (error) {
        console.error('Error getting recommendation data:', error);
        ResponseHandler.internalError(res, 'Error obteniendo los datos de la recomendación');
    }
});

// Tipos de recomendación (catálogo)
app.get('/api/catalog/recommendation-types', async (req: express.Request, res: express.Response) => {
    try {
        const tipoRepo = AppDataSource.getRepository(TipoRecomendacion);
        
        const tipos = await tipoRepo.find({
            where: { 
            } as any,
            order: { nombre: 'ASC' }
        });

        const tiposResponse = tipos.map(tipo => ({
            id: tipo.id,
            nombre: tipo.nombre,
            descripcion: tipo.descripcion,
            categoria: tipo.categoria,
            // CORRECCIÓN: Quitar 'activo' si no existe en la entidad
            created_at: tipo.createdAt
        }));

        ResponseHandler.success(res, tiposResponse, 'Tipos de recomendación obtenidos exitosamente');

    } catch (error) {
        console.error('Error getting recommendation types:', error);
        ResponseHandler.internalError(res, 'Error obteniendo los tipos de recomendación');
    }
});

// Generar recomendaciones automáticas
app.post('/api/ai/generate-recommendations', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { dataType, dataRange } = req.body;

        // CORRECCIÓN: Definir tipo explícito para relevantData
        let relevantData: any[] = [];
        
        switch (dataType) {
            case 'nutrition':
                const comidaRepo = AppDataSource.getRepository(RegistroComida);
                relevantData = await comidaRepo.find({
                    where: { usuarioId: patientId },
                    relations: ['items'],
                    order: { fecha: 'DESC' }
                });
                break;
            case 'activity':
                const actividadRepo = AppDataSource.getRepository(ActividadFisica);
                relevantData = await actividadRepo.find({
                    where: { usuarioId: patientId },
                    order: { fecha: 'DESC' }
                });
                break;
            case 'health':
                const pesoRepo = AppDataSource.getRepository(HistorialPeso);
                relevantData = await pesoRepo.find({
                    where: { usuarioId: patientId },
                    order: { fechaRegistro: 'DESC' }
                });
                break;
            default:
                relevantData = [];
        }

        // Filtrar por rango de fecha si se especifica
        if (dataRange && dataRange.startDate && dataRange.endDate) {
            const startDate = new Date(dataRange.startDate);
            const endDate = new Date(dataRange.endDate);
            endDate.setHours(23, 59, 59, 999);

            relevantData = relevantData.filter((item: any) => {
                const itemDate = item.fecha || item.fechaRegistro;
                return itemDate >= startDate && itemDate <= endDate;
            });
        }

        // Generar recomendaciones basadas en los datos
        const generatedRecommendations = await generateAutomaticRecommendations(
            patientId, 
            dataType, 
            relevantData
        );

        // Guardar recomendaciones generadas
        const recomendacionRepo = AppDataSource.getRepository(Recomendacion);
        const savedRecommendations = [];

        for (const rec of generatedRecommendations) {
            const nuevaRecomendacion = new Recomendacion();
            nuevaRecomendacion.usuarioId = patientId;
            nuevaRecomendacion.tipoRecomendacionId = 'auto_generated';
            nuevaRecomendacion.contenido = rec.contenido;
            nuevaRecomendacion.vigenciaHasta = new Date(rec.vigencia_hasta);
            nuevaRecomendacion.prioridad = rec.prioridad;
            nuevaRecomendacion.activa = true;

            const recomendacionGuardada = await recomendacionRepo.save(nuevaRecomendacion);
            savedRecommendations.push({
                id: recomendacionGuardada.id,
                contenido: recomendacionGuardada.contenido,
                fecha_generacion: recomendacionGuardada.fechaGeneracion,
                vigencia_hasta: recomendacionGuardada.vigenciaHasta,
                prioridad: recomendacionGuardada.prioridad,
                created_at: recomendacionGuardada.createdAt
            });
        }

        ResponseHandler.created(res, savedRecommendations, 'Recomendaciones automáticas generadas exitosamente');

    } catch (error) {
        console.error('Error generating automatic recommendations:', error);
        ResponseHandler.internalError(res, 'Error generando recomendaciones automáticas');
    }
});

// Funciones auxiliares (sin cambios)
async function generateAIRecommendation(context: any): Promise<any> {
    // Simulación de generación de recomendación por IA
    const recommendations = [
        {
            contenido: "Basado en tu actividad reciente, te recomendamos aumentar la hidratación durante el ejercicio. Bebe al menos 500ml de agua 30 minutos antes de tu rutina.",
            vigencia_hasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            prioridad: "media"
        },
        {
            contenido: "Tu consumo de proteínas parece bajo. Considera incluir fuentes de proteína magra como pollo, pescado o legumbres en tu cena.",
            vigencia_hasta: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            prioridad: "alta"
        },
        {
            contenido: "Excelente consistencia en tus caminatas. Para mayor beneficio, intenta aumentar gradualmente la duración en 5 minutos cada semana.",
            vigencia_hasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            prioridad: "baja"
        }
    ];

    return recommendations[Math.floor(Math.random() * recommendations.length)];
}

async function generateAutomaticRecommendations(patientId: string, dataType: string, data: any[]): Promise<any[]> {
    // Lógica para generar recomendaciones automáticas basadas en datos
    const recommendations = [];

    if (dataType === 'nutrition' && data.length > 0) {
        const totalCalories = data.reduce((sum, log) => {
            const items = log.items || [];
            return sum + items.reduce((itemSum: number, item: any) => 
                itemSum + (Number(item.calorias) || 0), 0);
        }, 0);

        const avgDailyCalories = totalCalories / data.length;

        if (avgDailyCalories > 2500) {
            recommendations.push({
                contenido: "Tu consumo calórico diario promedio es alto. Considera reducir las porciones o elegir opciones más ligeras.",
                vigencia_hasta: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                prioridad: "media"
            });
        } else if (avgDailyCalories < 1500) {
            recommendations.push({
                contenido: "Tu consumo calórico parece bajo. Asegúrate de consumir suficientes nutrientes para mantener tu energía.",
                vigencia_hasta: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                prioridad: "alta"
            });
        }
    }

    if (dataType === 'activity' && data.length > 0) {
        const totalMinutes = data.reduce((sum, activity) => sum + (activity.duracionMin || 0), 0);
        const avgDailyMinutes = totalMinutes / data.length;

        if (avgDailyMinutes < 30) {
            recommendations.push({
                contenido: "Tu actividad física diaria es menor a la recomendada. Intenta realizar al menos 30 minutos de actividad moderada al día.",
                vigencia_hasta: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
                prioridad: "alta"
            });
        } else if (avgDailyMinutes > 120) {
            recommendations.push({
                contenido: "Excelente nivel de actividad. Recuerda incluir días de descanso para una recuperación adecuada.",
                vigencia_hasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                prioridad: "baja"
            });
        }
    }

    return recommendations;
}

// Middleware de manejo de errores
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', error);
    ResponseHandler.internalError(res, 'Error interno del servidor');
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    ResponseHandler.notFound(res, 'Ruta no encontrada');
});

// Inicializar servidor
const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('✅ PostgreSQL conectado para Recommendation Service');
        
        app.listen(PORT, () => {
            console.log(`🚀 Recommendation Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting Recommendation Service:', error);
        process.exit(1);
    }
};

startServer();

export default app;