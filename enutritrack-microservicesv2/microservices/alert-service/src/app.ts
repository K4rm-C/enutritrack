// microservices/alert-service/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from '../../../shared/database/postgres';
import { authenticateToken } from '../../../shared/middleware/auth';
import { ResponseHandler } from '../../../shared/utils/response';
import { Alerta } from '../../../shared/entities/Alerta';
import { AlertaAccion } from '../../../shared/entities/AlertaAccion';
import { TipoAlerta } from '../../../shared/entities/TipoAlerta';
import { CategoriaAlerta } from '../../../shared/entities/CategoriaAlerta';
import { NivelPrioridadAlerta } from '../../../shared/entities/NivelPrioridadAlerta';
import { EstadoAlerta } from '../../../shared/entities/EstadoAlerta';
import { ConfiguracionAlertaAutomatica } from '../../../shared/entities/ConfiguracionAlertaAutomatica';

const app = express();
const PORT = process.env.PORT || 3006;

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
        service: 'alert-service',
        database: dbHealth ? 'connected' : 'disconnected'
    });
});

// Obtener alertas del doctor
app.get('/api/alerts/doctor', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const doctorId = req.user.id;
        const { estado, prioridad, page = 1, limit = 10 } = req.query;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const alertaRepo = AppDataSource.getRepository(Alerta);
        let query = alertaRepo
            .createQueryBuilder('alerta')
            .leftJoinAndSelect('alerta.usuario', 'usuario')
            .leftJoinAndSelect('alerta.tipoAlerta', 'tipoAlerta')
            .leftJoinAndSelect('alerta.nivelPrioridad', 'nivelPrioridad')
            .leftJoinAndSelect('alerta.estadoAlerta', 'estadoAlerta')
            .leftJoinAndSelect('alerta.acciones', 'acciones')
            .where('alerta.doctorId = :doctorId', { doctorId });

        if (estado) {
            query = query.andWhere('estadoAlerta.nombre = :estado', { estado });
        }

        if (prioridad) {
            query = query.andWhere('nivelPrioridad.nombre = :prioridad', { prioridad });
        }

        const [alertas, total] = await query
            .orderBy('alerta.fechaDeteccion', 'DESC')
            .skip(skip)
            .take(parseInt(limit))
            .getManyAndCount();

        const alertasResponse = alertas.map(alerta => ({
            id: alerta.id,
            titulo: alerta.titulo,
            mensaje: alerta.mensaje,
            usuario: {
                id: alerta.usuario.id,
                nombre: alerta.usuario.nombre,
                fecha_nacimiento: alerta.usuario.fechaNacimiento
            },
            tipo_alerta: alerta.tipoAlerta,
            nivel_prioridad: alerta.nivelPrioridad,
            estado_alerta: alerta.estadoAlerta,
            fecha_deteccion: alerta.fechaDeteccion,
            fecha_resolucion: alerta.fechaResolucion,
            acciones: alerta.acciones,
            recomendacion_id: alerta.recomendacionId
        }));

        ResponseHandler.paginated(res, alertasResponse, parseInt(page), parseInt(limit), total);

    } catch (error) {
        console.error('Error getting doctor alerts:', error);
        ResponseHandler.internalError(res, 'Error obteniendo las alertas');
    }
});

// Obtener alertas del paciente
app.get('/api/alerts/patient', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { estado, prioridad } = req.query;
        
        const alertaRepo = AppDataSource.getRepository(Alerta);
        let query = alertaRepo
            .createQueryBuilder('alerta')
            .leftJoinAndSelect('alerta.doctor', 'doctor')
            .leftJoinAndSelect('alerta.tipoAlerta', 'tipoAlerta')
            .leftJoinAndSelect('alerta.nivelPrioridad', 'nivelPrioridad')
            .leftJoinAndSelect('alerta.estadoAlerta', 'estadoAlerta')
            .where('alerta.usuarioId = :patientId', { patientId });

        if (estado) {
            query = query.andWhere('estadoAlerta.nombre = :estado', { estado });
        }

        if (prioridad) {
            query = query.andWhere('nivelPrioridad.nombre = :prioridad', { prioridad });
        }

        const alertas = await query
            .orderBy('alerta.fechaDeteccion', 'DESC')
            .getMany();

        const alertasResponse = alertas.map(alerta => ({
            id: alerta.id,
            titulo: alerta.titulo,
            mensaje: alerta.mensaje,
            doctor: alerta.doctor ? {
                id: alerta.doctor.id,
                nombre: alerta.doctor.nombre
            } : null,
            tipo_alerta: alerta.tipoAlerta,
            nivel_prioridad: alerta.nivelPrioridad,
            estado_alerta: alerta.estadoAlerta,
            fecha_deteccion: alerta.fechaDeteccion,
            fecha_resolucion: alerta.fechaResolucion
        }));

        ResponseHandler.success(res, alertasResponse);

    } catch (error) {
        console.error('Error getting patient alerts:', error);
        ResponseHandler.internalError(res, 'Error obteniendo las alertas');
    }
});

// Obtener detalle de alerta
app.get('/api/alerts/:alertId', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { alertId } = req.params;
        
        const alertaRepo = AppDataSource.getRepository(Alerta);
        const alerta = await alertaRepo.findOne({
            where: { id: alertId },
            relations: [
                'usuario',
                'doctor',
                'tipoAlerta',
                'nivelPrioridad',
                'estadoAlerta',
                'acciones',
                'acciones.doctor'
            ]
        });

        if (!alerta) {
            return ResponseHandler.notFound(res, 'Alerta no encontrada');
        }

        const alertaResponse = {
            id: alerta.id,
            titulo: alerta.titulo,
            mensaje: alerta.mensaje,
            usuario: {
                id: alerta.usuario.id,
                nombre: alerta.usuario.nombre,
                fecha_nacimiento: alerta.usuario.fechaNacimiento,
                telefono: alerta.usuario.telefono
            },
            doctor: alerta.doctor ? {
                id: alerta.doctor.id,
                nombre: alerta.doctor.nombre
            } : null,
            tipo_alerta: alerta.tipoAlerta,
            nivel_prioridad: alerta.nivelPrioridad,
            estado_alerta: alerta.estadoAlerta,
            fecha_deteccion: alerta.fechaDeteccion,
            fecha_resolucion: alerta.fechaResolucion,
            notas_resolucion: alerta.notasResolucion,
            acciones: alerta.acciones?.map(accion => ({
                id: accion.id,
                accion_tomada: accion.accionTomada,
                descripcion: accion.descripcion,
                fecha_accion: accion.fechaAccion,
                doctor: {
                    id: accion.doctor.id,
                    nombre: accion.doctor.nombre
                }
            })),
            recomendacion_id: alerta.recomendacionId
        };

        ResponseHandler.success(res, alertaResponse);

    } catch (error) {
        console.error('Error getting alert detail:', error);
        ResponseHandler.internalError(res, 'Error obteniendo el detalle de la alerta');
    }
});

// Tomar acción en alerta
app.post('/api/alerts/:alertId/action', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { alertId } = req.params;
        const { accion_tomada, descripcion } = req.body;
        const doctorId = req.user.id;
        
        // Verificar que la alerta existe
        const alertaRepo = AppDataSource.getRepository(Alerta);
        const alerta = await alertaRepo.findOne({
            where: { id: alertId }
        });

        if (!alerta) {
            return ResponseHandler.notFound(res, 'Alerta no encontrada');
        }

        // Crear acción
        const accionRepo = AppDataSource.getRepository(AlertaAccion);
        const nuevaAccion = accionRepo.create({
            alertaId: alertId,
            doctorId: doctorId,
            accionTomada: accion_tomada,
            descripcion: descripcion
        });

        await accionRepo.save(nuevaAccion);

        // Actualizar estado de la alerta a "en proceso" si está pendiente
        const estadoRepo = AppDataSource.getRepository(EstadoAlerta);
        const estadoEnProceso = await estadoRepo.findOne({
            where: { nombre: 'en_proceso' }
        });

        if (alerta.estadoAlertaId && (await estadoRepo.findOne({ where: { id: alerta.estadoAlertaId } }))?.nombre === 'pendiente') {
            if (estadoEnProceso) {
                alerta.estadoAlertaId = estadoEnProceso.id;
                alerta.updatedAt = new Date();
                await alertaRepo.save(alerta);
            }
        }

        ResponseHandler.success(res, null, 'Acción registrada exitosamente');

    } catch (error) {
        console.error('Error taking alert action:', error);
        ResponseHandler.internalError(res, 'Error registrando la acción');
    }
});

// Resolver alerta
app.put('/api/alerts/:alertId/resolve', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { alertId } = req.params;
        const { notas_resolucion } = req.body;
        const doctorId = req.user.id;
        
        const alertaRepo = AppDataSource.getRepository(Alerta);
        const alerta = await alertaRepo.findOne({
            where: { id: alertId }
        });

        if (!alerta) {
            return ResponseHandler.notFound(res, 'Alerta no encontrada');
        }

        // Buscar estado "resuelta"
        const estadoRepo = AppDataSource.getRepository(EstadoAlerta);
        const estadoResuelta = await estadoRepo.findOne({
            where: { nombre: 'resuelta' }
        });

        if (!estadoResuelta) {
            return ResponseHandler.internalError(res, 'No se pudo encontrar el estado resuelta');
        }

        // Actualizar alerta
        alerta.estadoAlertaId = estadoResuelta.id;
        alerta.fechaResolucion = new Date();
        alerta.resueltaPor = doctorId;
        alerta.notasResolucion = notas_resolucion;
        alerta.updatedAt = new Date();

        await alertaRepo.save(alerta);

        ResponseHandler.success(res, null, 'Alerta marcada como resuelta');

    } catch (error) {
        console.error('Error resolving alert:', error);
        ResponseHandler.internalError(res, 'Error resolviendo la alerta');
    }
});

// Obtener acciones de alerta
app.get('/api/alerts/:alertId/actions', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { alertId } = req.params;
        
        const accionRepo = AppDataSource.getRepository(AlertaAccion);
        const acciones = await accionRepo.find({
            where: { alertaId: alertId },
            relations: ['doctor'],
            order: { fechaAccion: 'DESC' }
        });

        const accionesResponse = acciones.map(accion => ({
            id: accion.id,
            accion_tomada: accion.accionTomada,
            descripcion: accion.descripcion,
            fecha_accion: accion.fechaAccion,
            doctor: {
                id: accion.doctor.id,
                nombre: accion.doctor.nombre
            }
        }));

        ResponseHandler.success(res, accionesResponse);

    } catch (error) {
        console.error('Error getting alert actions:', error);
        ResponseHandler.internalError(res, 'Error obteniendo las acciones de la alerta');
    }
});

// Obtener configuraciones de alertas automáticas del paciente
app.get('/api/patient/alert-configurations', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        
        const configRepo = AppDataSource.getRepository(ConfiguracionAlertaAutomatica);
        const configs = await configRepo.find({
            where: { usuarioId: patientId },
            relations: ['tipoAlerta', 'doctor']
        });

        const configsResponse = configs.map(config => ({
            id: config.id,
            tipo_alerta: config.tipoAlerta,
            doctor: config.doctor ? {
                id: config.doctor.id,
                nombre: config.doctor.nombre
            } : null,
            esta_activa: config.estaActiva,
            umbral_configuracion: config.umbralConfiguracion,
            frecuencia_verificacion_horas: config.frecuenciaVerificacionHoras,
            created_at: config.createdAt,
            updated_at: config.updatedAt
        }));

        ResponseHandler.success(res, configsResponse);

    } catch (error) {
        console.error('Error getting alert configurations:', error);
        ResponseHandler.internalError(res, 'Error obteniendo las configuraciones de alertas');
    }
});

// Actualizar configuración de alerta automática
app.put('/api/patient/alert-configurations/:configId', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { configId } = req.params;
        const updates = req.body;
        const patientId = req.user.id;
        
        const configRepo = AppDataSource.getRepository(ConfiguracionAlertaAutomatica);
        const config = await configRepo.findOne({
            where: { 
                id: configId,
                usuarioId: patientId 
            }
        });

        if (!config) {
            return ResponseHandler.notFound(res, 'Configuración no encontrada');
        }

        // Actualizar campos permitidos
        const allowedFields = ['esta_activa', 'umbral_configuracion', 'frecuencia_verificacion_horas'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                (config as any)[field] = updates[field];
            }
        });

        config.updatedAt = new Date();
        await configRepo.save(config);

        ResponseHandler.success(res, null, 'Configuración actualizada exitosamente');

    } catch (error) {
        console.error('Error updating alert configuration:', error);
        ResponseHandler.internalError(res, 'Error actualizando la configuración');
    }
});

// Catálogo de categorías de alerta
app.get('/api/catalog/alert-categories', async (req, res) => {
    try {
        const categoriasRepo = AppDataSource.getRepository(CategoriaAlerta);
        const categorias = await categoriasRepo.find({
            order: { nombre: 'ASC' }
        });

        ResponseHandler.success(res, categorias);

    } catch (error) {
        console.error('Error getting alert categories:', error);
        ResponseHandler.internalError(res, 'Error obteniendo las categorías de alerta');
    }
});

// Catálogo de prioridades de alerta
app.get('/api/catalog/alert-priorities', async (req, res) => {
    try {
        const prioridadesRepo = AppDataSource.getRepository(NivelPrioridadAlerta);
        const prioridades = await prioridadesRepo.find({
            order: { nivelNumerico: 'ASC' }
        });

        ResponseHandler.success(res, prioridades);

    } catch (error) {
        console.error('Error getting alert priorities:', error);
        ResponseHandler.internalError(res, 'Error obteniendo las prioridades de alerta');
    }
});

// Catálogo de estados de alerta
app.get('/api/catalog/alert-statuses', async (req, res) => {
    try {
        const estadosRepo = AppDataSource.getRepository(EstadoAlerta);
        const estados = await estadosRepo.find({
            order: { nombre: 'ASC' }
        });

        ResponseHandler.success(res, estados);

    } catch (error) {
        console.error('Error getting alert statuses:', error);
        ResponseHandler.internalError(res, 'Error obteniendo los estados de alerta');
    }
});

// Catálogo de tipos de alerta
app.get('/api/catalog/alert-types', async (req, res) => {
    try {
        const tiposRepo = AppDataSource.getRepository(TipoAlerta);
        const tipos = await tiposRepo.find({
            relations: ['categoria'],
            order: { nombre: 'ASC' }
        });

        ResponseHandler.success(res, tipos);

    } catch (error) {
        console.error('Error getting alert types:', error);
        ResponseHandler.internalError(res, 'Error obteniendo los tipos de alerta');
    }
});

// Crear nueva alerta manualmente
app.post('/api/alerts', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const {
            usuario_id,
            tipo_alerta_id,
            nivel_prioridad_id,
            titulo,
            mensaje,
            recomendacion_id
        } = req.body;
        
        const doctorId = req.user.id;

        // Validar campos requeridos
        if (!usuario_id || !tipo_alerta_id || !nivel_prioridad_id || !titulo || !mensaje) {
            return ResponseHandler.internalError(res, 'Faltan campos requeridos');
        }

        // Verificar que el tipo de alerta existe
        const tipoAlertaRepo = AppDataSource.getRepository(TipoAlerta);
        const tipoAlerta = await tipoAlertaRepo.findOne({
            where: { id: tipo_alerta_id }
        });

        if (!tipoAlerta) {
            return ResponseHandler.notFound(res, 'Tipo de alerta no encontrado');
        }

        // Verificar que la prioridad existe
        const prioridadRepo = AppDataSource.getRepository(NivelPrioridadAlerta);
        const prioridad = await prioridadRepo.findOne({
            where: { id: nivel_prioridad_id }
        });

        if (!prioridad) {
            return ResponseHandler.notFound(res, 'Nivel de prioridad no encontrado');
        }

        // Obtener estado "pendiente" por defecto
        const estadoRepo = AppDataSource.getRepository(EstadoAlerta);
        const estadoPendiente = await estadoRepo.findOne({
            where: { nombre: 'pendiente' }
        });

        if (!estadoPendiente) {
            return ResponseHandler.internalError(res, 'No se pudo encontrar el estado pendiente');
        }

        // Crear la alerta
        const alertaRepo = AppDataSource.getRepository(Alerta);
        const nuevaAlerta = alertaRepo.create({
            usuarioId: usuario_id,
            doctorId: doctorId,
            tipoAlertaId: tipo_alerta_id,
            nivelPrioridadId: nivel_prioridad_id,
            estadoAlertaId: estadoPendiente.id,
            titulo: titulo,
            mensaje: mensaje,
            recomendacionId: recomendacion_id,
            fechaDeteccion: new Date()
        });

        await alertaRepo.save(nuevaAlerta);

        ResponseHandler.success(res, { id: nuevaAlerta.id }, 'Alerta creada exitosamente', 201);

    } catch (error) {
        console.error('Error creating alert:', error);
        ResponseHandler.internalError(res, 'Error creando la alerta');
    }
});

// Actualizar alerta
app.put('/api/alerts/:alertId', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { alertId } = req.params;
        const {
            tipo_alerta_id,
            nivel_prioridad_id,
            titulo,
            mensaje,
            estado_alerta_id
        } = req.body;
        
        const alertaRepo = AppDataSource.getRepository(Alerta);
        const alerta = await alertaRepo.findOne({
            where: { id: alertId }
        });

        if (!alerta) {
            return ResponseHandler.notFound(res, 'Alerta no encontrada');
        }

        // Validar tipo de alerta si se proporciona
        if (tipo_alerta_id) {
            const tipoAlertaRepo = AppDataSource.getRepository(TipoAlerta);
            const tipoAlerta = await tipoAlertaRepo.findOne({
                where: { id: tipo_alerta_id }
            });
            if (!tipoAlerta) {
                return ResponseHandler.notFound(res, 'Tipo de alerta no encontrado');
            }
            alerta.tipoAlertaId = tipo_alerta_id;
        }

        // Validar nivel de prioridad si se proporciona
        if (nivel_prioridad_id) {
            const prioridadRepo = AppDataSource.getRepository(NivelPrioridadAlerta);
            const prioridad = await prioridadRepo.findOne({
                where: { id: nivel_prioridad_id }
            });
            if (!prioridad) {
                return ResponseHandler.notFound(res, 'Nivel de prioridad no encontrado');
            }
            alerta.nivelPrioridadId = nivel_prioridad_id;
        }

        // Validar estado de alerta si se proporciona
        if (estado_alerta_id) {
            const estadoRepo = AppDataSource.getRepository(EstadoAlerta);
            const estado = await estadoRepo.findOne({
                where: { id: estado_alerta_id }
            });
            if (!estado) {
                return ResponseHandler.notFound(res, 'Estado de alerta no encontrado');
            }
            alerta.estadoAlertaId = estado_alerta_id;
        }

        // Actualizar otros campos
        if (titulo !== undefined) alerta.titulo = titulo;
        if (mensaje !== undefined) alerta.mensaje = mensaje;
        alerta.updatedAt = new Date();

        await alertaRepo.save(alerta);

        ResponseHandler.success(res, null, 'Alerta actualizada exitosamente');

    } catch (error) {
        console.error('Error updating alert:', error);
        ResponseHandler.internalError(res, 'Error actualizando la alerta');
    }
});

// Estadísticas de alertas para dashboard del doctor
app.get('/api/alerts/doctor/stats', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const doctorId = req.user.id;
        const { days = 30 } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const alertaRepo = AppDataSource.getRepository(Alerta);

        // Total de alertas
        const totalAlertas = await alertaRepo
            .createQueryBuilder('alerta')
            .where('alerta.doctorId = :doctorId', { doctorId })
            .andWhere('alerta.fechaDeteccion >= :startDate', { startDate })
            .getCount();

        // Alertas por estado
        const alertasPorEstado = await alertaRepo
            .createQueryBuilder('alerta')
            .leftJoinAndSelect('alerta.estadoAlerta', 'estadoAlerta')
            .select('estadoAlerta.nombre', 'estado')
            .addSelect('COUNT(alerta.id)', 'count')
            .where('alerta.doctorId = :doctorId', { doctorId })
            .andWhere('alerta.fechaDeteccion >= :startDate', { startDate })
            .groupBy('estadoAlerta.nombre')
            .getRawMany();

        // Alertas por prioridad
        const alertasPorPrioridad = await alertaRepo
            .createQueryBuilder('alerta')
            .leftJoinAndSelect('alerta.nivelPrioridad', 'nivelPrioridad')
            .select('nivelPrioridad.nombre', 'prioridad')
            .addSelect('COUNT(alerta.id)', 'count')
            .where('alerta.doctorId = :doctorId', { doctorId })
            .andWhere('alerta.fechaDeteccion >= :startDate', { startDate })
            .groupBy('nivelPrioridad.nombre')
            .getRawMany();

        // Alertas por tipo
        const alertasPorTipo = await alertaRepo
            .createQueryBuilder('alerta')
            .leftJoinAndSelect('alerta.tipoAlerta', 'tipoAlerta')
            .select('tipoAlerta.nombre', 'tipo')
            .addSelect('COUNT(alerta.id)', 'count')
            .where('alerta.doctorId = :doctorId', { doctorId })
            .andWhere('alerta.fechaDeteccion >= :startDate', { startDate })
            .groupBy('tipoAlerta.nombre')
            .orderBy('count', 'DESC')
            .limit(5)
            .getRawMany();

        // Tiempo promedio de resolución
        const tiempoResolucion = await alertaRepo
            .createQueryBuilder('alerta')
            .select('AVG(EXTRACT(EPOCH FROM (alerta.fechaResolucion - alerta.fechaDeteccion)) / 3600)', 'avg_hours')
            .where('alerta.doctorId = :doctorId', { doctorId })
            .andWhere('alerta.fechaResolucion IS NOT NULL')
            .andWhere('alerta.fechaDeteccion >= :startDate', { startDate })
            .getRawOne();

        const stats = {
            total_alertas: totalAlertas,
            alertas_por_estado: alertasPorEstado,
            alertas_por_prioridad: alertasPorPrioridad,
            alertas_por_tipo: alertasPorTipo,
            tiempo_promedio_resolucion_horas: parseFloat(tiempoResolucion?.avg_hours || 0).toFixed(2),
            periodo_dias: parseInt(days)
        };

        ResponseHandler.success(res, stats);

    } catch (error) {
        console.error('Error getting alert stats:', error);
        ResponseHandler.internalError(res, 'Error obteniendo estadísticas de alertas');
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

// Inicializar base de datos y servidor
const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected successfully');

        app.listen(PORT, () => {
            console.log(`Alert service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();

export default app;