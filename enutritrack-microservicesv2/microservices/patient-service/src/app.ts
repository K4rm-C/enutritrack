// microservices/patient-service/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from '../../../shared/database/postgres';
import { authenticateToken } from '../../../shared/middleware/auth';
import { ResponseHandler } from '../../../shared/utils/response';
import { PerfilUsuario } from '../../../shared/entities/PerfilUsuario';
import { HistorialPeso } from '../../../shared/entities/HistorialPeso';
import { ObjetivoUsuario } from '../../../shared/entities/ObjetivoUsuario';
import { CondicionMedica } from '../../../shared/entities/CondicionMedica';
import { Alergia } from '../../../shared/entities/Alergia';
import { Medicamento } from '../../../shared/entities/Medicamento';

const app = express();
const PORT = process.env.PORT || 3004;

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
        service: 'patient-service',
        database: dbHealth ? 'connected' : 'disconnected'
    });
});

// Dashboard del paciente
app.get('/api/patient/dashboard', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        
        const usuarioRepo = AppDataSource.getRepository(PerfilUsuario);
        const pesoRepo = AppDataSource.getRepository(HistorialPeso);
        const objetivoRepo = AppDataSource.getRepository(ObjetivoUsuario);

        // Peso actual
        const pesoActual = await pesoRepo.findOne({
            where: { usuarioId: patientId },
            order: { fechaRegistro: 'DESC' }
        });

        // Objetivo actual
        const objetivoActual = await objetivoRepo.findOne({
            where: { 
                usuarioId: patientId,
                vigente: true 
            }
        });

        const dashboardData = {
            peso_actual: pesoActual?.peso || null,
            objetivo_peso: objetivoActual?.pesoObjetivo || null,
            nivel_actividad: objetivoActual?.nivelActividad || 'moderado',
            fecha_establecido: objetivoActual?.fechaEstablecido || null
        };

        ResponseHandler.success(res, dashboardData);

    } catch (error) {
        console.error('Error getting patient dashboard:', error);
        ResponseHandler.internalError(res, 'Error obteniendo el dashboard');
    }
});

// Obtener perfil del paciente
app.get('/api/users/patient/profile', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        
        const usuarioRepo = AppDataSource.getRepository(PerfilUsuario);
        const profile = await usuarioRepo.findOne({
            where: { id: patientId },
            relations: ['genero', 'doctor', 'cuenta']
        });

        if (!profile) {
            return ResponseHandler.notFound(res, 'Perfil de paciente no encontrado');
        }

        const profileResponse = {
            id: profile.id,
            nombre: profile.nombre,
            fecha_nacimiento: profile.fechaNacimiento,
            genero: profile.genero,
            altura: profile.altura,
            telefono: profile.telefono,
            telefono_1: profile.telefono1,
            telefono_2: profile.telefono2,
            email: profile.cuenta?.email,
            doctor: profile.doctor ? {
                id: profile.doctor.id,
                nombre: profile.doctor.nombre,
                especialidad: profile.doctor.especialidad
            } : null
        };

        ResponseHandler.success(res, profileResponse);

    } catch (error) {
        console.error('Error getting patient profile:', error);
        ResponseHandler.internalError(res, 'Error obteniendo el perfil');
    }
});

// Actualizar perfil del paciente
app.put('/api/users/patient/profile', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { nombre, telefono, telefono_1, telefono_2 } = req.body;
        
        const usuarioRepo = AppDataSource.getRepository(PerfilUsuario);
        const paciente = await usuarioRepo.findOne({
            where: { id: patientId }
        });

        if (!paciente) {
            return ResponseHandler.notFound(res, 'Paciente no encontrado');
        }

        // Actualizar campos permitidos
        if (nombre !== undefined) paciente.nombre = nombre;
        if (telefono !== undefined) paciente.telefono = telefono;
        if (telefono_1 !== undefined) paciente.telefono1 = telefono_1;
        if (telefono_2 !== undefined) paciente.telefono2 = telefono_2;
        
        paciente.updatedAt = new Date();
        await usuarioRepo.save(paciente);

        // Obtener perfil actualizado con relaciones
        const updatedProfile = await usuarioRepo.findOne({
            where: { id: patientId },
            relations: ['genero', 'doctor', 'cuenta']
        });

        const profileResponse = {
            id: updatedProfile!.id,
            nombre: updatedProfile!.nombre,
            fecha_nacimiento: updatedProfile!.fechaNacimiento,
            genero: updatedProfile!.genero,
            altura: updatedProfile!.altura,
            telefono: updatedProfile!.telefono,
            telefono_1: updatedProfile!.telefono1,
            telefono_2: updatedProfile!.telefono2,
            email: updatedProfile!.cuenta?.email,
            doctor: updatedProfile!.doctor ? {
                id: updatedProfile!.doctor.id,
                nombre: updatedProfile!.doctor.nombre
            } : null
        };

        ResponseHandler.success(res, profileResponse, 'Perfil actualizado exitosamente');

    } catch (error) {
        console.error('Error updating patient profile:', error);
        ResponseHandler.internalError(res, 'Error actualizando el perfil');
    }
});

// Obtener condiciones médicas del paciente
app.get('/api/patient/medical-conditions', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        
        const condicionesRepo = AppDataSource.getRepository(CondicionMedica);
        const condiciones = await condicionesRepo.find({
            where: { usuarioId: patientId },
            order: { createdAt: 'DESC' }
        });

        const condicionesResponse = condiciones.map(condicion => ({
            id: condicion.id,
            nombre: condicion.nombre,
            severidad: condicion.severidad,
            fecha_diagnostico: condicion.fechaDiagnostico,
            notas: condicion.notas,
            activa: condicion.activa,
            created_at: condicion.createdAt,
            updated_at: condicion.updatedAt
        }));

        ResponseHandler.success(res, condicionesResponse);

    } catch (error) {
        console.error('Error getting medical conditions:', error);
        ResponseHandler.internalError(res, 'Error obteniendo las condiciones médicas');
    }
});

// Agregar condición médica (paciente) - CORREGIDO
app.post('/api/patient/medical-conditions', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { nombre, severidad, fecha_diagnostico, notas, activa } = req.body;

        // Validar campos requeridos
        if (!nombre) {
            return ResponseHandler.internalError(res, 'El nombre de la condición médica es requerido');
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

// Obtener alergias del paciente
app.get('/api/patient/allergies', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        
        const alergiasRepo = AppDataSource.getRepository(Alergia);
        const alergias = await alergiasRepo.find({
            where: { usuarioId: patientId },
            order: { createdAt: 'DESC' }
        });

        const alergiasResponse = alergias.map(alergia => ({
            id: alergia.id,
            tipo: alergia.tipo,
            nombre: alergia.nombre,
            severidad: alergia.severidad,
            reaccion: alergia.reaccion,
            notas: alergia.notas,
            activa: alergia.activa,
            created_at: alergia.createdAt,
            updated_at: alergia.updatedAt
        }));

        ResponseHandler.success(res, alergiasResponse);

    } catch (error) {
        console.error('Error getting allergies:', error);
        ResponseHandler.internalError(res, 'Error obteniendo las alergias');
    }
});

// Agregar alergia (paciente) - CORREGIDO
app.post('/api/patient/allergies', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { tipo, nombre, severidad, reaccion, notas, activa } = req.body;

        // Validar campos requeridos
        if (!nombre || !tipo) {
            return ResponseHandler.internalError(res, 'El tipo y nombre de la alergia son requeridos');
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

// Obtener medicamentos del paciente
app.get('/api/patient/medications', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        
        const medicamentosRepo = AppDataSource.getRepository(Medicamento);
        const medicamentos = await medicamentosRepo.find({
            where: { usuarioId: patientId },
            order: { createdAt: 'DESC' }
        });

        const medicamentosResponse = medicamentos.map(medicamento => ({
            id: medicamento.id,
            nombre: medicamento.nombre,
            dosis: medicamento.dosis,
            frecuencia: medicamento.frecuencia,
            fecha_inicio: medicamento.fechaInicio,
            fecha_fin: medicamento.fechaFin || null,
            notas: medicamento.notas,
            activo: medicamento.activo,
            created_at: medicamento.createdAt,
            updated_at: medicamento.updatedAt
        }));

        ResponseHandler.success(res, medicamentosResponse);

    } catch (error) {
        console.error('Error getting medications:', error);
        ResponseHandler.internalError(res, 'Error obteniendo los medicamentos');
    }
});

// Agregar medicamento (paciente) - CORREGIDO
app.post('/api/patient/medications', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { nombre, dosis, frecuencia, fecha_inicio, fecha_fin, notas, activo } = req.body;

        // Validar campos requeridos
        if (!nombre || !dosis || !frecuencia || !fecha_inicio) {
            return ResponseHandler.internalError(res, 'Nombre, dosis, frecuencia y fecha de inicio son requeridos');
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

// Historial de peso
app.get('/api/patient/weight-history', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { startDate, endDate } = req.query;
        
        const pesoRepo = AppDataSource.getRepository(HistorialPeso);
        let query = pesoRepo
            .createQueryBuilder('peso')
            .where('peso.usuarioId = :patientId', { patientId });

        if (startDate) {
            query = query.andWhere('peso.fechaRegistro >= :startDate', { startDate: new Date(startDate as string) });
        }

        if (endDate) {
            query = query.andWhere('peso.fechaRegistro <= :endDate', { endDate: new Date(endDate as string) });
        }

        const historial = await query
            .orderBy('peso.fechaRegistro', 'DESC')
            .getMany();

        const historialResponse = historial.map(registro => ({
            id: registro.id,
            peso: registro.peso,
            fecha_registro: registro.fechaRegistro,
            notas: registro.notas
        }));

        ResponseHandler.success(res, historialResponse);

    } catch (error) {
        console.error('Error getting weight history:', error);
        ResponseHandler.internalError(res, 'Error obteniendo el historial de peso');
    }
});

// Agregar registro de peso - CORREGIDO
app.post('/api/patient/weight-history', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { peso, fecha_registro, notas } = req.body;

        // Validar campos requeridos
        if (!peso) {
            return ResponseHandler.internalError(res, 'El peso es requerido');
        }

        const pesoRepo = AppDataSource.getRepository(HistorialPeso);
        
        // Crear usando new en lugar de .create()
        const nuevoRegistro = new HistorialPeso();
        nuevoRegistro.usuarioId = patientId;
        nuevoRegistro.peso = peso;
        nuevoRegistro.fechaRegistro = fecha_registro ? new Date(fecha_registro) : new Date();
        nuevoRegistro.notas = notas || '';

        const registroGuardado = await pesoRepo.save(nuevoRegistro);

        ResponseHandler.created(res, {
            id: registroGuardado.id,
            peso: registroGuardado.peso,
            fecha_registro: registroGuardado.fechaRegistro,
            notas: registroGuardado.notas
        }, 'Registro de peso agregado exitosamente');

    } catch (error) {
        console.error('Error adding weight record:', error);
        ResponseHandler.internalError(res, 'Error agregando el registro de peso');
    }
});

// Obtener objetivos
app.get('/api/patient/goals', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        
        const objetivoRepo = AppDataSource.getRepository(ObjetivoUsuario);
        const objetivos = await objetivoRepo.find({
            where: { usuarioId: patientId },
            order: { fechaEstablecido: 'DESC' }
        });

        const objetivosResponse = objetivos.map(objetivo => ({
            id: objetivo.id,
            peso_objetivo: objetivo.pesoObjetivo,
            nivel_actividad: objetivo.nivelActividad,
            fecha_establecido: objetivo.fechaEstablecido,
            vigente: objetivo.vigente
        }));

        ResponseHandler.success(res, objetivosResponse);

    } catch (error) {
        console.error('Error getting goals:', error);
        ResponseHandler.internalError(res, 'Error obteniendo los objetivos');
    }
});

// Establecer objetivo - CORREGIDO
app.post('/api/patient/goals', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const patientId = req.user.id;
        const { peso_objetivo, nivel_actividad } = req.body;

        // Validar campos requeridos
        if (!peso_objetivo || !nivel_actividad) {
            return ResponseHandler.internalError(res, 'El peso objetivo y nivel de actividad son requeridos');
        }

        const objetivoRepo = AppDataSource.getRepository(ObjetivoUsuario);

        // Desactivar objetivos anteriores
        await objetivoRepo.update(
            { usuarioId: patientId, vigente: true },
            { vigente: false }
        );

        // Crear nuevo objetivo usando new
        const nuevoObjetivo = new ObjetivoUsuario();
        nuevoObjetivo.usuarioId = patientId;
        nuevoObjetivo.pesoObjetivo = peso_objetivo;
        nuevoObjetivo.nivelActividad = nivel_actividad;
        nuevoObjetivo.fechaEstablecido = new Date();
        nuevoObjetivo.vigente = true;

        const objetivoGuardado = await objetivoRepo.save(nuevoObjetivo);

        ResponseHandler.created(res, {
            id: objetivoGuardado.id,
            peso_objetivo: objetivoGuardado.pesoObjetivo,
            nivel_actividad: objetivoGuardado.nivelActividad,
            fecha_establecido: objetivoGuardado.fechaEstablecido,
            vigente: objetivoGuardado.vigente
        }, 'Objetivo establecido exitosamente');

    } catch (error) {
        console.error('Error setting goal:', error);
        ResponseHandler.internalError(res, 'Error estableciendo el objetivo');
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
        console.log('✅ PostgreSQL conectado para Patient Service');
        
        app.listen(PORT, () => {
            console.log(`🚀 Patient Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting Patient Service:', error);
        process.exit(1);
    }
};

startServer();

export default app;