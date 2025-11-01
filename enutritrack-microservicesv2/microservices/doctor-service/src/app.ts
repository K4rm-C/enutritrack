// microservices/doctor-service/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from '../../../shared/database/postgres';
import { authenticateToken } from '../../../shared/middleware/auth';
import { ResponseHandler } from '../../../shared/utils/response';
import { PerfilDoctor } from '../../../shared/entities/PerfilDoctor';
import { PerfilUsuario } from '../../../shared/entities/PerfilUsuario';
import { CitaMedica } from '../../../shared/entities/CitaMedica';
import { Alerta } from '../../../shared/entities/Alerta';
import { CondicionMedica } from '../../../shared/entities/CondicionMedica';
import { Alergia } from '../../../shared/entities/Alergia';
import { Medicamento } from '../../../shared/entities/Medicamento';
import { EstadoAlerta } from '../../../shared/entities/EstadoAlerta';
import { Between, ILike, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

const app = express();
const PORT = process.env.PORT || 3003;

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
        service: 'doctor-service',
        database: dbHealth ? 'connected' : 'disconnected'
    });
});

// Dashboard del doctor - CORREGIDO con enfoque consistente
app.get('/api/doctor/dashboard', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const doctorId = req.user.id;
        
        const doctorRepo = AppDataSource.getRepository(PerfilDoctor);
        const usuarioRepo = AppDataSource.getRepository(PerfilUsuario);
        const citaRepo = AppDataSource.getRepository(CitaMedica);
        const alertaRepo = AppDataSource.getRepository(Alerta);
        const estadoAlertaRepo = AppDataSource.getRepository(EstadoAlerta);

        // Verificar que el doctor existe
        const doctor = await doctorRepo.findOne({
            where: { id: doctorId }
        });

        if (!doctor) {
            return ResponseHandler.notFound(res, 'Perfil de doctor no encontrado');
        }

        // Total pacientes - CORREGIDO
        const totalPacientes = await usuarioRepo.count({
            where: { doctorId: doctorId }
        });

        // Citas de hoy - CORREGIDO usando QueryBuilder para consistencia
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        const citasHoy = await citaRepo
            .createQueryBuilder('cita')
            .where('cita.doctorId = :doctorId', { doctorId })
            .andWhere('cita.fechaHoraProgramada >= :hoy', { hoy })
            .andWhere('cita.fechaHoraProgramada < :manana', { manana })
            .getCount();

        // Alertas pendientes - CORREGIDO usando QueryBuilder
        const estadoPendiente = await estadoAlertaRepo.findOne({
            where: { nombre: 'pendiente' }
        });

        let alertasPendientes = 0;
        if (estadoPendiente) {
            alertasPendientes = await alertaRepo
                .createQueryBuilder('alerta')
                .where('alerta.doctorId = :doctorId', { doctorId })
                .andWhere('alerta.estadoAlertaId = :estadoId', { estadoId: estadoPendiente.id })
                .getCount();
        }

        // Próximas citas - CORREGIDO usando QueryBuilder
        const proximasCitas = await citaRepo
            .createQueryBuilder('cita')
            .leftJoinAndSelect('cita.usuario', 'usuario')
            .leftJoinAndSelect('cita.tipoConsulta', 'tipoConsulta')
            .leftJoinAndSelect('cita.estadoCita', 'estadoCita')
            .where('cita.doctorId = :doctorId', { doctorId })
            .andWhere('cita.fechaHoraProgramada >= :now', { now: new Date() })
            .orderBy('cita.fechaHoraProgramada', 'ASC')
            .take(5)
            .getMany();

        // Pacientes recientes (últimos 7 días) - CORREGIDO usando QueryBuilder
        const unaSemanaAtras = new Date();
        unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);

        const pacientesRecientes = await usuarioRepo
            .createQueryBuilder('usuario')
            .where('usuario.doctorId = :doctorId', { doctorId })
            .andWhere('usuario.createdAt >= :unaSemanaAtras', { unaSemanaAtras })
            .getCount();

        const dashboardData = {
            totalPacientes,
            citasHoy,
            alertasPendientes,
            pacientesRecientes,
            proximasCitas: proximasCitas.map(cita => ({
                id: cita.id,
                fecha_hora_programada: cita.fechaHoraProgramada,
                usuario: cita.usuario ? { 
                    id: cita.usuario.id,
                    nombre: cita.usuario.nombre 
                } : null,
                tipo_consulta: cita.tipoConsulta ? { 
                    id: cita.tipoConsulta.id,
                    nombre: cita.tipoConsulta.nombre 
                } : null,
                estado_cita: cita.estadoCita ? { 
                    id: cita.estadoCita.id,
                    nombre: cita.estadoCita.nombre 
                } : null
            }))
        };

        ResponseHandler.success(res, dashboardData);

    } catch (error) {
        console.error('Error getting doctor dashboard:', error);
        ResponseHandler.internalError(res, 'Error obteniendo el dashboard');
    }
});

// Listar pacientes del doctor - YA CORRECTO (usa QueryBuilder)
app.get('/api/doctor/patients', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const doctorId = req.user.id;
        const { page = 1, limit = 10, search } = req.query;
        
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        
        const usuarioRepo = AppDataSource.getRepository(PerfilUsuario);
        let queryBuilder = usuarioRepo
            .createQueryBuilder('usuario')
            .leftJoinAndSelect('usuario.genero', 'genero')
            .where('usuario.doctorId = :doctorId', { doctorId });

        if (search) {
            queryBuilder = queryBuilder.andWhere('usuario.nombre ILIKE :search', { search: `%${search}%` });
        }

        const [pacientes, total] = await queryBuilder
            .orderBy('usuario.nombre', 'ASC')
            .skip(skip)
            .take(parseInt(limit as string))
            .getManyAndCount();

        const pacientesResponse = pacientes.map(paciente => ({
            id: paciente.id,
            nombre: paciente.nombre,
            fecha_nacimiento: paciente.fechaNacimiento,
            genero: paciente.genero,
            altura: paciente.altura,
            telefono: paciente.telefono,
            telefono_1: paciente.telefono1,
            telefono_2: paciente.telefono2,
            created_at: paciente.createdAt
        }));

        ResponseHandler.paginated(res, pacientesResponse, parseInt(page as string), parseInt(limit as string), total);

    } catch (error) {
        console.error('Error getting doctor patients:', error);
        ResponseHandler.internalError(res, 'Error obteniendo los pacientes');
    }
});

// Obtener detalle del paciente - YA CORRECTO (usa FindOptions)
app.get('/api/doctor/patients/:patientId', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;
        
        const usuarioRepo = AppDataSource.getRepository(PerfilUsuario);
        const paciente = await usuarioRepo.findOne({
            where: { 
                id: patientId,
                doctorId: doctorId
            },
            relations: ['genero', 'cuenta']
        });

        if (!paciente) {
            return ResponseHandler.notFound(res, 'Paciente no encontrado');
        }

        const pacienteResponse = {
            id: paciente.id,
            nombre: paciente.nombre,
            fecha_nacimiento: paciente.fechaNacimiento,
            genero: paciente.genero,
            altura: paciente.altura,
            telefono: paciente.telefono,
            telefono_1: paciente.telefono1,
            telefono_2: paciente.telefono2,
            email: paciente.cuenta?.email,
            created_at: paciente.createdAt,
            updated_at: paciente.updatedAt
        };

        ResponseHandler.success(res, pacienteResponse);

    } catch (error) {
        console.error('Error getting patient detail:', error);
        ResponseHandler.internalError(res, 'Error obteniendo el detalle del paciente');
    }
});

// Obtener historial médico del paciente - YA CORRECTO (usa FindOptions)
app.get('/api/doctor/patients/:patientId/medical-history', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;
        
        // Verificar que el paciente pertenezca al doctor
        const usuarioRepo = AppDataSource.getRepository(PerfilUsuario);
        const paciente = await usuarioRepo.findOne({
            where: { 
                id: patientId,
                doctorId: doctorId
            }
        });

        if (!paciente) {
            return ResponseHandler.notFound(res, 'Paciente no encontrado');
        }

        const condicionesRepo = AppDataSource.getRepository(CondicionMedica);
        const alergiasRepo = AppDataSource.getRepository(Alergia);
        const medicamentosRepo = AppDataSource.getRepository(Medicamento);

        const [condiciones, alergias, medicamentos] = await Promise.all([
            condicionesRepo.find({ 
                where: { usuarioId: patientId },
                order: { createdAt: 'DESC' }
            }),
            alergiasRepo.find({ 
                where: { usuarioId: patientId },
                order: { createdAt: 'DESC' }
            }),
            medicamentosRepo.find({ 
                where: { usuarioId: patientId },
                order: { createdAt: 'DESC' }
            })
        ]);

        const medicalHistory = {
            condiciones: condiciones.map(c => ({
                id: c.id,
                nombre: c.nombre,
                severidad: c.severidad,
                fecha_diagnostico: c.fechaDiagnostico,
                notas: c.notas,
                activa: c.activa,
                created_at: c.createdAt
            })),
            alergias: alergias.map(a => ({
                id: a.id,
                tipo: a.tipo,
                nombre: a.nombre,
                severidad: a.severidad,
                reaccion: a.reaccion,
                notas: a.notas,
                activa: a.activa,
                created_at: a.createdAt
            })),
            medicamentos: medicamentos.map(m => ({
                id: m.id,
                nombre: m.nombre,
                dosis: m.dosis,
                frecuencia: m.frecuencia,
                fecha_inicio: m.fechaInicio,
                fecha_fin: m.fechaFin || null,
                notas: m.notas,
                activo: m.activo,
                created_at: m.createdAt
            }))
        };

        ResponseHandler.success(res, medicalHistory);

    } catch (error) {
        console.error('Error getting medical history:', error);
        ResponseHandler.internalError(res, 'Error obteniendo el historial médico');
    }
});

// Agregar condición médica - YA CORREGIDO
app.post('/api/doctor/patients/:patientId/medical-conditions', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;
        const { nombre, severidad, fecha_diagnostico, notas, activa } = req.body;
        
        // Validar campos requeridos
        if (!nombre) {
            return ResponseHandler.internalError(res, 'El nombre de la condición médica es requerido');
        }

        // Verificar que el paciente pertenezca al doctor
        const usuarioRepo = AppDataSource.getRepository(PerfilUsuario);
        const paciente = await usuarioRepo.findOne({
            where: { 
                id: patientId,
                doctorId: doctorId
            }
        });

        if (!paciente) {
            return ResponseHandler.notFound(res, 'Paciente no encontrado');
        }

        const condicionesRepo = AppDataSource.getRepository(CondicionMedica);
        
        // Crear usando new en lugar de .create()
        const nuevaCondicion = new CondicionMedica();
        nuevaCondicion.usuarioId = patientId;
        nuevaCondicion.nombre = nombre;
        nuevaCondicion.severidad = severidad || 'moderada';
        nuevaCondicion.fechaDiagnostico = fecha_diagnostico ? new Date(fecha_diagnostico) : new Date();
        nuevaCondicion.notas = notas || '';
        nuevaCondicion.activa = activa !== undefined ? activa : true;

        const condicionGuardada = await condicionesRepo.save(nuevaCondicion);

        ResponseHandler.created(res, {
            id: condicionGuardada.id,
            nombre: condicionGuardada.nombre,
            severidad: condicionGuardada.severidad,
            fecha_diagnostico: condicionGuardada.fechaDiagnostico,
            notas: condicionGuardada.notas,
            activa: condicionGuardada.activa,
            created_at: condicionGuardada.createdAt
        }, 'Condición médica agregada exitosamente');

    } catch (error) {
        console.error('Error adding medical condition:', error);
        ResponseHandler.internalError(res, 'Error agregando la condición médica');
    }
});

// Agregar alergia - YA CORREGIDO
app.post('/api/doctor/patients/:patientId/allergies', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;
        const { tipo, nombre, severidad, reaccion, notas, activa } = req.body;
        
        // Validar campos requeridos
        if (!nombre || !tipo) {
            return ResponseHandler.internalError(res, 'El tipo y nombre de la alergia son requeridos');
        }

        // Verificar que el paciente pertenezca al doctor
        const usuarioRepo = AppDataSource.getRepository(PerfilUsuario);
        const paciente = await usuarioRepo.findOne({
            where: { 
                id: patientId,
                doctorId: doctorId
            }
        });

        if (!paciente) {
            return ResponseHandler.notFound(res, 'Paciente no encontrado');
        }

        const alergiasRepo = AppDataSource.getRepository(Alergia);
        
        // Crear usando new en lugar de .create()
        const nuevaAlergia = new Alergia();
        nuevaAlergia.usuarioId = patientId;
        nuevaAlergia.tipo = tipo;
        nuevaAlergia.nombre = nombre;
        nuevaAlergia.severidad = severidad || 'moderada';
        nuevaAlergia.reaccion = reaccion || '';
        nuevaAlergia.notas = notas || '';
        nuevaAlergia.activa = activa !== undefined ? activa : true;

        const alergiaGuardada = await alergiasRepo.save(nuevaAlergia);

        ResponseHandler.created(res, {
            id: alergiaGuardada.id,
            tipo: alergiaGuardada.tipo,
            nombre: alergiaGuardada.nombre,
            severidad: alergiaGuardada.severidad,
            reaccion: alergiaGuardada.reaccion,
            notas: alergiaGuardada.notas,
            activa: alergiaGuardada.activa,
            created_at: alergiaGuardada.createdAt
        }, 'Alergia agregada exitosamente');

    } catch (error) {
        console.error('Error adding allergy:', error);
        ResponseHandler.internalError(res, 'Error agregando la alergia');
    }
});

// Agregar medicamento - YA CORREGIDO
app.post('/api/doctor/patients/:patientId/medications', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;
        const { nombre, dosis, frecuencia, fecha_inicio, fecha_fin, notas, activo } = req.body;
        
        // Validar campos requeridos
        if (!nombre || !dosis || !frecuencia || !fecha_inicio) {
            return ResponseHandler.internalError(res, 'Nombre, dosis, frecuencia y fecha de inicio son requeridos');
        }

        // Verificar que el paciente pertenezca al doctor
        const usuarioRepo = AppDataSource.getRepository(PerfilUsuario);
        const paciente = await usuarioRepo.findOne({
            where: { 
                id: patientId,
                doctorId: doctorId
            }
        });

        if (!paciente) {
            return ResponseHandler.notFound(res, 'Paciente no encontrado');
        }

        const medicamentosRepo = AppDataSource.getRepository(Medicamento);
        
        // Crear usando new en lugar de .create()
        const nuevoMedicamento = new Medicamento();
        nuevoMedicamento.usuarioId = patientId;
        nuevoMedicamento.nombre = nombre;
        nuevoMedicamento.dosis = dosis;
        nuevoMedicamento.frecuencia = frecuencia;
        nuevoMedicamento.fechaInicio = new Date(fecha_inicio);
        nuevoMedicamento.fechaFin = fecha_fin ? new Date(fecha_fin) : undefined;
        nuevoMedicamento.notas = notas || '';
        nuevoMedicamento.activo = activo !== undefined ? activo : true;

        const medicamentoGuardado = await medicamentosRepo.save(nuevoMedicamento);

        ResponseHandler.created(res, {
            id: medicamentoGuardado.id,
            nombre: medicamentoGuardado.nombre,
            dosis: medicamentoGuardado.dosis,
            frecuencia: medicamentoGuardado.frecuencia,
            fecha_inicio: medicamentoGuardado.fechaInicio,
            fecha_fin: medicamentoGuardado.fechaFin || null,
            notas: medicamentoGuardado.notas,
            activo: medicamentoGuardado.activo,
            created_at: medicamentoGuardado.createdAt
        }, 'Medicamento agregado exitosamente');

    } catch (error) {
        console.error('Error adding medication:', error);
        ResponseHandler.internalError(res, 'Error agregando el medicamento');
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
        console.log('✅ PostgreSQL conectado para Doctor Service');
        
        app.listen(PORT, () => {
            console.log(`🚀 Doctor Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting Doctor Service:', error);
        process.exit(1);
    }
};

startServer();

export default app;