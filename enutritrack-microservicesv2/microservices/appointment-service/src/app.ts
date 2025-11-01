// microservices/appointment-service/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from '../../../shared/database/postgres';
import { authenticateToken } from '../../../shared/middleware/auth';
import { ResponseHandler } from '../../../shared/utils/response';
import { CitaMedica } from '../../../shared/entities/CitaMedica';
import { CitaDocumento } from '../../../shared/entities/CitaDocumento';
import { CitaSignosVitales } from '../../../shared/entities/CitaSignosVitales';
import { TipoConsulta } from '../../../shared/entities/TipoConsulta';
import { EstadoCita } from '../../../shared/entities/EstadoCita';

const app = express();
const PORT = process.env.PORT || 3005;

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
        service: 'appointment-service',
        database: dbHealth ? 'connected' : 'disconnected'
    });
});

// Obtener citas del doctor
app.get('/api/appointments/doctor', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const doctorId = req.user.id;
        const { fecha, estado, page = 1, limit = 10 } = req.query;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const citaRepo = AppDataSource.getRepository(CitaMedica);
        let query = citaRepo
            .createQueryBuilder('cita')
            .leftJoinAndSelect('cita.usuario', 'usuario')
            .leftJoinAndSelect('cita.tipoConsulta', 'tipoConsulta')
            .leftJoinAndSelect('cita.estadoCita', 'estadoCita')
            .where('cita.doctorId = :doctorId', { doctorId });

        if (fecha) {
            const fechaObj = new Date(fecha);
            const fechaInicio = new Date(fechaObj.setHours(0, 0, 0, 0));
            const fechaFin = new Date(fechaObj.setHours(23, 59, 59, 999));
            query = query.andWhere('cita.fechaHoraProgramada BETWEEN :fechaInicio AND :fechaFin', {
                fechaInicio,
                fechaFin
            });
        }

        if (estado) {
            query = query.andWhere('estadoCita.nombre = :estado', { estado });
        }

        const [citas, total] = await query
            .orderBy('cita.fechaHoraProgramada', 'ASC')
            .skip(skip)
            .take(parseInt(limit))
            .getManyAndCount();

        const citasResponse = citas.map(cita => ({
            id: cita.id,
            fecha_hora_programada: cita.fechaHoraProgramada,
            fecha_hora_inicio: cita.fechaHoraInicio,
            fecha_hora_fin: cita.fechaHoraFin,
            usuario: {
                id: cita.usuario.id,
                nombre: cita.usuario.nombre
            },
            tipo_consulta: cita.tipoConsulta,
            estado_cita: cita.estadoCita,
            motivo: cita.motivo,
            observaciones: cita.observaciones,
            diagnostico: cita.diagnostico,
            tratamiento_recomendado: cita.tratamientoRecomendado,
            proxima_cita_sugerida: cita.proximaCitaSugerida
        }));

        ResponseHandler.paginated(res, citasResponse, parseInt(page), parseInt(limit), total);

    } catch (error) {
        console.error('Error getting doctor appointments:', error);
        ResponseHandler.internalError(res, 'Error obteniendo las citas');
    }
});

// Obtener citas del paciente
app.get('/api/appointments/patient', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { fecha, estado } = req.query;
        
        const citaRepo = AppDataSource.getRepository(CitaMedica);
        let query = citaRepo
            .createQueryBuilder('cita')
            .leftJoinAndSelect('cita.doctor', 'doctor')
            .leftJoinAndSelect('cita.tipoConsulta', 'tipoConsulta')
            .leftJoinAndSelect('cita.estadoCita', 'estadoCita')
            .where('cita.usuarioId = :patientId', { patientId });

        if (fecha) {
            const fechaObj = new Date(fecha);
            const fechaInicio = new Date(fechaObj.setHours(0, 0, 0, 0));
            const fechaFin = new Date(fechaObj.setHours(23, 59, 59, 999));
            query = query.andWhere('cita.fechaHoraProgramada BETWEEN :fechaInicio AND :fechaFin', {
                fechaInicio,
                fechaFin
            });
        }

        if (estado) {
            query = query.andWhere('estadoCita.nombre = :estado', { estado });
        }

        const citas = await query
            .orderBy('cita.fechaHoraProgramada', 'ASC')
            .getMany();

        const citasResponse = citas.map(cita => ({
            id: cita.id,
            fecha_hora_programada: cita.fechaHoraProgramada,
            fecha_hora_inicio: cita.fechaHoraInicio,
            fecha_hora_fin: cita.fechaHoraFin,
            doctor: {
                id: cita.doctor.id,
                nombre: cita.doctor.nombre,
                especialidad: cita.doctor.especialidad
            },
            tipo_consulta: cita.tipoConsulta,
            estado_cita: cita.estadoCita,
            motivo: cita.motivo,
            observaciones: cita.observaciones,
            diagnostico: cita.diagnostico,
            tratamiento_recomendado: cita.tratamientoRecomendado
        }));

        ResponseHandler.success(res, citasResponse);

    } catch (error) {
        console.error('Error getting patient appointments:', error);
        ResponseHandler.internalError(res, 'Error obteniendo las citas');
    }
});

// Obtener detalle de cita
app.get('/api/appointments/:appointmentId', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { appointmentId } = req.params;
        
        const citaRepo = AppDataSource.getRepository(CitaMedica);
        const cita = await citaRepo.findOne({
            where: { id: appointmentId },
            relations: [
                'usuario', 
                'doctor', 
                'tipoConsulta', 
                'estadoCita',
                'signosVitales',
                'documentos'
            ]
        });

        if (!cita) {
            return ResponseHandler.notFound(res, 'Cita no encontrada');
        }

        const citaResponse = {
            id: cita.id,
            fecha_hora_programada: cita.fechaHoraProgramada,
            fecha_hora_inicio: cita.fechaHoraInicio,
            fecha_hora_fin: cita.fechaHoraFin,
            usuario: {
                id: cita.usuario.id,
                nombre: cita.usuario.nombre,
                fecha_nacimiento: cita.usuario.fechaNacimiento,
                telefono: cita.usuario.telefono
            },
            doctor: {
                id: cita.doctor.id,
                nombre: cita.doctor.nombre,
                especialidad: cita.doctor.especialidad,
                cedula_profesional: cita.doctor.cedulaProfesional
            },
            tipo_consulta: cita.tipoConsulta,
            estado_cita: cita.estadoCita,
            motivo: cita.motivo,
            observaciones: cita.observaciones,
            diagnostico: cita.diagnostico,
            tratamiento_recomendado: cita.tratamientoRecomendado,
            proxima_cita_sugerida: cita.proximaCitaSugerida,
            signos_vitales: cita.signosVitales,
            documentos: cita.documentos,
            created_at: cita.createdAt,
            updated_at: cita.updatedAt
        };

        ResponseHandler.success(res, citaResponse);

    } catch (error) {
        console.error('Error getting appointment detail:', error);
        ResponseHandler.internalError(res, 'Error obteniendo el detalle de la cita');
    }
});

// Crear cita
app.post('/api/appointments', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const appointmentData = req.body;
        const user = req.user;
        
        const citaRepo = AppDataSource.getRepository(CitaMedica);
        
        // Buscar estado "pendiente" por defecto
        const estadoRepo = AppDataSource.getRepository(EstadoCita);
        const estadoPendiente = await estadoRepo.findOne({
            where: { nombre: 'pendiente' }
        });

        if (!estadoPendiente) {
            return ResponseHandler.internalError(res, 'No se pudo encontrar el estado de cita por defecto');
        }

        const nuevaCita = citaRepo.create({
            usuarioId: user.tipo === 'patient' ? user.id : appointmentData.usuario_id,
            doctorId: user.tipo === 'doctor' ? user.id : appointmentData.doctor_id,
            tipoConsultaId: appointmentData.tipo_consulta_id,
            estadoCitaId: estadoPendiente.id,
            fechaHoraProgramada: new Date(appointmentData.fecha_hora_programada),
            motivo: appointmentData.motivo
        });

        const citaGuardada = await citaRepo.save(nuevaCita);

        // Obtener cita con relaciones
        const citaCompleta = await citaRepo.findOne({
            where: { id: citaGuardada.id },
            relations: ['usuario', 'doctor', 'tipoConsulta', 'estadoCita']
        });

        const citaResponse = {
            id: citaCompleta!.id,
            fecha_hora_programada: citaCompleta!.fechaHoraProgramada,
            usuario: {
                id: citaCompleta!.usuario.id,
                nombre: citaCompleta!.usuario.nombre
            },
            doctor: {
                id: citaCompleta!.doctor.id,
                nombre: citaCompleta!.doctor.nombre
            },
            tipo_consulta: citaCompleta!.tipoConsulta,
            estado_cita: citaCompleta!.estadoCita,
            motivo: citaCompleta!.motivo
        };

        ResponseHandler.created(res, citaResponse, 'Cita creada exitosamente');

    } catch (error) {
        console.error('Error creating appointment:', error);
        ResponseHandler.internalError(res, 'Error creando la cita');
    }
});

// Actualizar cita
app.put('/api/appointments/:appointmentId', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { appointmentId } = req.params;
        const updates = req.body;
        
        const citaRepo = AppDataSource.getRepository(CitaMedica);
        const cita = await citaRepo.findOne({
            where: { id: appointmentId }
        });

        if (!cita) {
            return ResponseHandler.notFound(res, 'Cita no encontrada');
        }

        // Actualizar campos permitidos
        const allowedFields = [
            'fecha_hora_programada', 'fecha_hora_inicio', 'fecha_hora_fin',
            'motivo', 'observaciones', 'diagnostico', 'tratamiento_recomendado',
            'proxima_cita_sugerida', 'estado_cita_id'
        ];

        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                if (field === 'fecha_hora_programada' || field === 'fecha_hora_inicio' || field === 'fecha_hora_fin') {
                    (cita as any)[field] = new Date(updates[field]);
                } else if (field === 'estado_cita_id') {
                    cita.estadoCitaId = updates[field];
                } else {
                    (cita as any)[field] = updates[field];
                }
            }
        });

        cita.updatedAt = new Date();
        await citaRepo.save(cita);

        // Obtener cita actualizada con relaciones
        const citaActualizada = await citaRepo.findOne({
            where: { id: appointmentId },
            relations: ['usuario', 'doctor', 'tipoConsulta', 'estadoCita']
        });

        const citaResponse = {
            id: citaActualizada!.id,
            fecha_hora_programada: citaActualizada!.fechaHoraProgramada,
            fecha_hora_inicio: citaActualizada!.fechaHoraInicio,
            fecha_hora_fin: citaActualizada!.fechaHoraFin,
            usuario: {
                id: citaActualizada!.usuario.id,
                nombre: citaActualizada!.usuario.nombre
            },
            doctor: {
                id: citaActualizada!.doctor.id,
                nombre: citaActualizada!.doctor.nombre
            },
            tipo_consulta: citaActualizada!.tipoConsulta,
            estado_cita: citaActualizada!.estadoCita,
            motivo: citaActualizada!.motivo,
            observaciones: citaActualizada!.observaciones,
            diagnostico: citaActualizada!.diagnostico,
            tratamiento_recomendado: citaActualizada!.tratamientoRecomendado,
            proxima_cita_sugerida: citaActualizada!.proximaCitaSugerida
        };

        ResponseHandler.success(res, citaResponse, 'Cita actualizada exitosamente');

    } catch (error) {
        console.error('Error updating appointment:', error);
        ResponseHandler.internalError(res, 'Error actualizando la cita');
    }
});

// Obtener signos vitales de cita
app.get('/api/appointments/:appointmentId/vitals', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { appointmentId } = req.params;
        
        const signosRepo = AppDataSource.getRepository(CitaSignosVitales);
        const signos = await signosRepo.find({
            where: { citaMedicaId: appointmentId },
            order: { createdAt: 'DESC' }
        });

        ResponseHandler.success(res, signos);

    } catch (error) {
        console.error('Error getting appointment vitals:', error);
        ResponseHandler.internalError(res, 'Error obteniendo los signos vitales');
    }
});

// Agregar signos vitales a cita
app.post('/api/appointments/:appointmentId/vitals', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { appointmentId } = req.params;
        const vitalsData = req.body;
        
        // Verificar que la cita existe
        const citaRepo = AppDataSource.getRepository(CitaMedica);
        const cita = await citaRepo.findOne({
            where: { id: appointmentId }
        });

        if (!cita) {
            return ResponseHandler.notFound(res, 'Cita no encontrada');
        }

        const signosRepo = AppDataSource.getRepository(CitaSignosVitales);
        const nuevosSignos = signosRepo.create({
            citaMedicaId: appointmentId,
            peso: vitalsData.peso,
            altura: vitalsData.altura,
            tensionArterialSistolica: vitalsData.tension_arterial_sistolica,
            tensionArterialDiastolica: vitalsData.tension_arterial_diastolica,
            frecuenciaCardiaca: vitalsData.frecuencia_cardiaca,
            temperatura: vitalsData.temperatura,
            saturacionOxigeno: vitalsData.saturacion_oxigeno,
            notas: vitalsData.notas
        });

        const signosGuardados = await signosRepo.save(nuevosSignos);

        ResponseHandler.created(res, signosGuardados, 'Signos vitales agregados exitosamente');

    } catch (error) {
        console.error('Error adding appointment vitals:', error);
        ResponseHandler.internalError(res, 'Error agregando los signos vitales');
    }
});

// Obtener documentos de cita
app.get('/api/appointments/:appointmentId/documents', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { appointmentId } = req.params;
        
        const documentosRepo = AppDataSource.getRepository(CitaDocumento);
        const documentos = await documentosRepo.find({
            where: { citaMedicaId: appointmentId },
            order: { createdAt: 'DESC' }
        });

        ResponseHandler.success(res, documentos);

    } catch (error) {
        console.error('Error getting appointment documents:', error);
        ResponseHandler.internalError(res, 'Error obteniendo los documentos');
    }
});

// Agregar documento a cita
app.post('/api/appointments/:appointmentId/documents', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { appointmentId } = req.params;
        const documentData = req.body;
        
        // Verificar que la cita existe
        const citaRepo = AppDataSource.getRepository(CitaMedica);
        const cita = await citaRepo.findOne({
            where: { id: appointmentId }
        });

        if (!cita) {
            return ResponseHandler.notFound(res, 'Cita no encontrada');
        }

        const documentosRepo = AppDataSource.getRepository(CitaDocumento);
        const nuevoDocumento = documentosRepo.create({
            citaMedicaId: appointmentId,
            nombreArchivo: documentData.nombre_archivo,
            tipoDocumento: documentData.tipo_documento,
            rutaArchivo: documentData.ruta_archivo,
            tamanoBytes: documentData.tamano_bytes,
            notas: documentData.notas
        });

        const documentoGuardado = await documentosRepo.save(nuevoDocumento);

        ResponseHandler.created(res, documentoGuardado, 'Documento agregado exitosamente');

    } catch (error) {
        console.error('Error adding appointment document:', error);
        ResponseHandler.internalError(res, 'Error agregando el documento');
    }
});

// Catálogo de tipos de consulta
app.get('/api/catalog/consultation-types', async (req, res) => {
    try {
        const tiposRepo = AppDataSource.getRepository(TipoConsulta);
        const tipos = await tiposRepo.find({
            order: { nombre: 'ASC' }
        });

        ResponseHandler.success(res, tipos);

    } catch (error) {
        console.error('Error getting consultation types:', error);
        ResponseHandler.internalError(res, 'Error obteniendo los tipos de consulta');
    }
});

// Catálogo de estados de cita
app.get('/api/catalog/appointment-statuses', async (req, res) => {
    try {
        const estadosRepo = AppDataSource.getRepository(EstadoCita);
        const estados = await estadosRepo.find({
            order: { nombre: 'ASC' }
        });

        ResponseHandler.success(res, estados);

    } catch (error) {
        console.error('Error getting appointment statuses:', error);
        ResponseHandler.internalError(res, 'Error obteniendo los estados de cita');
    }
});

// Inicializar servidor
const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('✅ PostgreSQL conectado para Appointment Service');
        
        app.listen(PORT, () => {
            console.log(`🚀 Appointment Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting Appointment Service:', error);
        process.exit(1);
    }
};

startServer();