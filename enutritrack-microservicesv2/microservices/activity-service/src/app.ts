// microservices/activity-service/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from '../../../shared/database/postgres';
import { authenticateToken } from '../../../shared/middleware/auth';
import { ResponseHandler } from '../../../shared/utils/response';
import { ActividadFisica } from '../../../shared/entities/ActividadFisica';
import { TipoActividad } from '../../../shared/entities/TipoActividad';
import { HistorialPeso } from '../../../shared/entities/HistorialPeso';
import { calculateCaloriesBurned } from '../../../shared/utils';

const app = express();
const PORT = process.env.PORT || 3008;

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
        service: 'activity-service',
        database: dbHealth ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Actividad física del paciente
app.get('/api/activity/logs', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { fecha, tipo_actividad, page = 1, limit = 10 } = req.query;
        
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        
        const actividadRepo = AppDataSource.getRepository(ActividadFisica);
        let queryBuilder = actividadRepo
            .createQueryBuilder('actividad')
            .leftJoinAndSelect('actividad.tipoActividad', 'tipoActividad')
            .where('actividad.usuarioId = :patientId', { patientId });

        // Filtrar por fecha
        if (fecha) {
            const fechaObj = new Date(fecha as string);
            const fechaInicio = new Date(fechaObj);
            fechaInicio.setHours(0, 0, 0, 0);
            const fechaFin = new Date(fechaObj);
            fechaFin.setHours(23, 59, 59, 999);
            
            queryBuilder = queryBuilder.andWhere('actividad.fecha BETWEEN :fechaInicio AND :fechaFin', {
                fechaInicio,
                fechaFin
            });
        }

        // Filtrar por tipo de actividad
        if (tipo_actividad) {
            queryBuilder = queryBuilder.andWhere('actividad.tipoActividadId = :tipoActividad', {
                tipoActividad: tipo_actividad
            });
        }

        const [actividades, total] = await queryBuilder
            .orderBy('actividad.fecha', 'DESC')
            .skip(skip)
            .take(parseInt(limit as string))
            .getManyAndCount();

        const actividadesResponse = actividades.map(actividad => ({
            id: actividad.id,
            tipo_actividad: actividad.tipoActividad ? {
                id: actividad.tipoActividad.id,
                nombre: actividad.tipoActividad.nombre,
                categoria: actividad.tipoActividad.categoria,
                met_value: actividad.tipoActividad.metValue
            } : null,
            duracion_min: actividad.duracionMin,
            calorias_quemadas: actividad.caloriasQuemadas,
            intensidad: actividad.intensidad,
            notas: actividad.notas,
            fecha: actividad.fecha,
            created_at: actividad.createdAt,
        }));

        ResponseHandler.paginated(res, actividadesResponse, parseInt(page as string), parseInt(limit as string), total);

    } catch (error) {
        console.error('Error getting activities:', error);
        ResponseHandler.internalError(res, 'Error obteniendo las actividades');
    }
});

// Registrar actividad física
app.post('/api/activity/logs', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { tipo_actividad_id, duracion_min, intensidad, notas, fecha } = req.body;

        // Validar campos requeridos
        if (!tipo_actividad_id || !duracion_min) {
            return ResponseHandler.internalError(res, 'Tipo de actividad y duración son requeridos');
        }

        const actividadRepo = AppDataSource.getRepository(ActividadFisica);
        const tipoActividadRepo = AppDataSource.getRepository(TipoActividad);
        const pesoRepo = AppDataSource.getRepository(HistorialPeso);

        // Verificar que el tipo de actividad existe
        const tipoActividad = await tipoActividadRepo.findOne({
            where: { id: tipo_actividad_id }
        });

        if (!tipoActividad) {
            return ResponseHandler.notFound(res, 'Tipo de actividad no encontrado');
        }

        // Obtener peso actual del paciente para calcular calorías
        const pesoActual = await pesoRepo.findOne({
            where: { usuarioId: patientId },
            order: { fechaRegistro: 'DESC' }
        });

        const currentWeight = pesoActual?.peso || 70; // Peso por defecto 70kg

        // Calcular calorías quemadas
        const caloriasQuemadas = calculateCaloriesBurned(
            tipoActividad.metValue,
            currentWeight,
            duracion_min
        );

        // Crear nueva actividad
        const nuevaActividad = new ActividadFisica();
        nuevaActividad.usuarioId = patientId;
        nuevaActividad.tipoActividadId = tipo_actividad_id;
        nuevaActividad.duracionMin = duracion_min;
        nuevaActividad.caloriasQuemadas = caloriasQuemadas;
        nuevaActividad.intensidad = intensidad || 'moderada';
        nuevaActividad.notas = notas || '';
        nuevaActividad.fecha = fecha ? new Date(fecha) : new Date();

        const actividadGuardada = await actividadRepo.save(nuevaActividad);

        // Obtener actividad con relaciones para la respuesta
        const actividadCompleta = await actividadRepo.findOne({
            where: { id: actividadGuardada.id },
            relations: ['tipoActividad']
        });

        const responseData = {
            id: actividadCompleta!.id,
            tipo_actividad: actividadCompleta!.tipoActividad ? {
                id: actividadCompleta!.tipoActividad.id,
                nombre: actividadCompleta!.tipoActividad.nombre,
                categoria: actividadCompleta!.tipoActividad.categoria,
                met_value: actividadCompleta!.tipoActividad.metValue
            } : null,
            duracion_min: actividadCompleta!.duracionMin,
            calorias_quemadas: actividadCompleta!.caloriasQuemadas,
            intensidad: actividadCompleta!.intensidad,
            notas: actividadCompleta!.notas,
            fecha: actividadCompleta!.fecha,
            created_at: actividadCompleta!.createdAt
        };

        ResponseHandler.created(res, responseData, 'Actividad registrada exitosamente');

    } catch (error) {
        console.error('Error creating activity:', error);
        ResponseHandler.internalError(res, 'Error registrando la actividad');
    }
});

// Tipos de actividad (catálogo)
app.get('/api/activity/types', async (req: express.Request, res: express.Response) => {
    try {
        const { categoria } = req.query;
        
        const tipoActividadRepo = AppDataSource.getRepository(TipoActividad);
        let queryBuilder = tipoActividadRepo
            .createQueryBuilder('tipo')
            .where('tipo.activo = :activo', { activo: true });

        // Filtrar por categoría
        if (categoria) {
            queryBuilder = queryBuilder.andWhere('tipo.categoria = :categoria', { 
                categoria: categoria 
            });
        }

        const tipos = await queryBuilder
            .orderBy('tipo.nombre', 'ASC')
            .getMany();

        const tiposResponse = tipos.map(tipo => ({
            id: tipo.id,
            nombre: tipo.nombre,
            descripcion: tipo.descripcion,
            categoria: tipo.categoria,
            met_value: tipo.metValue,
            activo: tipo.categoria,
            created_at: tipo.createdAt
        }));

        ResponseHandler.success(res, tiposResponse, 'Tipos de actividad obtenidos exitosamente');

    } catch (error) {
        console.error('Error getting activity types:', error);
        ResponseHandler.internalError(res, 'Error obteniendo los tipos de actividad');
    }
});

// Resumen de actividad
app.get('/api/activity/summary', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { startDate, endDate } = req.query;
        
        const actividadRepo = AppDataSource.getRepository(ActividadFisica);
        
        // Construir query base
        let queryBuilder = actividadRepo
            .createQueryBuilder('actividad')
            .leftJoinAndSelect('actividad.tipoActividad', 'tipoActividad')
            .where('actividad.usuarioId = :patientId', { patientId });

        // Filtrar por rango de fechas
        if (startDate) {
            queryBuilder = queryBuilder.andWhere('actividad.fecha >= :startDate', {
                startDate: new Date(startDate as string)
            });
        }

        if (endDate) {
            const endDateObj = new Date(endDate as string);
            endDateObj.setHours(23, 59, 59, 999);
            queryBuilder = queryBuilder.andWhere('actividad.fecha <= :endDate', {
                endDate: endDateObj
            });
        }

        const actividades = await queryBuilder
            .orderBy('actividad.fecha', 'DESC')
            .getMany();

        // Calcular estadísticas
        let totalMinutos = 0;
        let totalCalorias = 0;
        const actividadesPorTipo: { [key: string]: number } = {};

        for (const actividad of actividades) {
            totalMinutos += actividad.duracionMin;
            totalCalorias += actividad.caloriasQuemadas;

            // Contar por tipo de actividad
            if (actividad.tipoActividad) {
                const tipoNombre = actividad.tipoActividad.nombre;
                actividadesPorTipo[tipoNombre] = (actividadesPorTipo[tipoNombre] || 0) + 1;
            }
        }

        // Calcular promedios
        const diasConActividad = new Set(
            actividades.map(a => a.fecha.toISOString().split('T')[0])
        ).size;

        const summary = {
            periodo: {
                start_date: startDate || (actividades.length > 0 ? actividades[actividades.length - 1].fecha : null),
                end_date: endDate || (actividades.length > 0 ? actividades[0].fecha : null)
            },
            total_actividades: actividades.length,
            total_minutos: totalMinutos,
            total_calorias: Math.round(totalCalorias),
            promedio_diario: {
                minutos: diasConActividad > 0 ? Math.round(totalMinutos / diasConActividad) : 0,
                calorias: diasConActividad > 0 ? Math.round(totalCalorias / diasConActividad) : 0
            },
            actividades_por_tipo: actividadesPorTipo,
            actividad_reciente: actividades.length > 0 ? {
                id: actividades[0].id,
                tipo_actividad: actividades[0].tipoActividad?.nombre,
                duracion_min: actividades[0].duracionMin,
                calorias_quemadas: actividades[0].caloriasQuemadas,
                fecha: actividades[0].fecha
            } : null
        };

        ResponseHandler.success(res, summary, 'Resumen de actividad obtenido exitosamente');

    } catch (error) {
        console.error('Error getting activity summary:', error);
        ResponseHandler.internalError(res, 'Error obteniendo el resumen de actividad');
    }
});

// Obtener actividad específica
app.get('/api/activity/logs/:activityId', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { activityId } = req.params;
        const patientId = req.user.id;
        
        const actividadRepo = AppDataSource.getRepository(ActividadFisica);
        const actividad = await actividadRepo.findOne({
            where: { 
                id: activityId,
                usuarioId: patientId 
            },
            relations: ['tipoActividad']
        });

        if (!actividad) {
            return ResponseHandler.notFound(res, 'Actividad no encontrada');
        }

        const actividadResponse = {
            id: actividad.id,
            tipo_actividad: actividad.tipoActividad ? {
                id: actividad.tipoActividad.id,
                nombre: actividad.tipoActividad.nombre,
                categoria: actividad.tipoActividad.categoria,
                met_value: actividad.tipoActividad.metValue,
                descripcion: actividad.tipoActividad.descripcion
            } : null,
            duracion_min: actividad.duracionMin,
            calorias_quemadas: actividad.caloriasQuemadas,
            intensidad: actividad.intensidad,
            notas: actividad.notas,
            fecha: actividad.fecha,
            created_at: actividad.createdAt,
        };

        ResponseHandler.success(res, actividadResponse);

    } catch (error) {
        console.error('Error getting activity detail:', error);
        ResponseHandler.internalError(res, 'Error obteniendo el detalle de la actividad');
    }
});

// Actualizar actividad
app.put('/api/activity/logs/:activityId', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { activityId } = req.params;
        const patientId = req.user.id;
        const { tipo_actividad_id, duracion_min, intensidad, notas, fecha } = req.body;
        
        const actividadRepo = AppDataSource.getRepository(ActividadFisica);
        const tipoActividadRepo = AppDataSource.getRepository(TipoActividad);
        const pesoRepo = AppDataSource.getRepository(HistorialPeso);

        // Verificar que la actividad existe y pertenece al paciente
        const actividad = await actividadRepo.findOne({
            where: { 
                id: activityId,
                usuarioId: patientId 
            }
        });

        if (!actividad) {
            return ResponseHandler.notFound(res, 'Actividad no encontrada');
        }

        // Si se cambia el tipo de actividad o duración, recalcular calorías
        let caloriasQuemadas = actividad.caloriasQuemadas;
        
        if (tipo_actividad_id || duracion_min) {
            const tipoActividadId = tipo_actividad_id || actividad.tipoActividadId;
            const duracionMin = duracion_min || actividad.duracionMin;

            const tipoActividad = await tipoActividadRepo.findOne({
                where: { id: tipoActividadId }
            });

            if (!tipoActividad) {
                return ResponseHandler.notFound(res, 'Tipo de actividad no encontrado');
            }

            // Obtener peso actual para recalcular
            const pesoActual = await pesoRepo.findOne({
                where: { usuarioId: patientId },
                order: { fechaRegistro: 'DESC' }
            });

            const currentWeight = pesoActual?.peso || 70;
            caloriasQuemadas = calculateCaloriesBurned(
                tipoActividad.metValue,
                currentWeight,
                duracionMin
            );

            if (tipo_actividad_id) actividad.tipoActividadId = tipoActividadId;
            if (duracion_min) actividad.duracionMin = duracionMin;
        }

        // Actualizar campos
        actividad.caloriasQuemadas = caloriasQuemadas;
        if (intensidad !== undefined) actividad.intensidad = intensidad;
        if (notas !== undefined) actividad.notas = notas;
        if (fecha !== undefined) actividad.fecha = new Date(fecha);
        actividad.createdAt = new Date();

        await actividadRepo.save(actividad);

        ResponseHandler.success(res, null, 'Actividad actualizada exitosamente');

    } catch (error) {
        console.error('Error updating activity:', error);
        ResponseHandler.internalError(res, 'Error actualizando la actividad');
    }
});

// Eliminar actividad
app.delete('/api/activity/logs/:activityId', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { activityId } = req.params;
        const patientId = req.user.id;
        
        const actividadRepo = AppDataSource.getRepository(ActividadFisica);

        // Verificar que la actividad existe y pertenece al paciente
        const actividad = await actividadRepo.findOne({
            where: { 
                id: activityId,
                usuarioId: patientId 
            }
        });

        if (!actividad) {
            return ResponseHandler.notFound(res, 'Actividad no encontrada');
        }

        await actividadRepo.remove(actividad);

        ResponseHandler.success(res, null, 'Actividad eliminada exitosamente');

    } catch (error) {
        console.error('Error deleting activity:', error);
        ResponseHandler.internalError(res, 'Error eliminando la actividad');
    }
});

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
        console.log('✅ PostgreSQL conectado para Activity Service');
        
        app.listen(PORT, () => {
            console.log(`🚀 Activity Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting Activity Service:', error);
        process.exit(1);
    }
};

startServer();

export default app;