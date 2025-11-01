// microservices/user-service/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from '../../../shared/database/postgres';
import { authenticateToken } from '../../../shared/middleware/auth';
import { ResponseHandler } from '../../../shared/utils/response';
import { PerfilDoctor } from '../../../shared/entities/PerfilDoctor';
import { Especialidad } from '../../../shared/entities/Especialidad';
import { Genero } from '../../../shared/entities/Genero';

const app = express();
const PORT = process.env.PORT || 3002;

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
        service: 'user-service',
        database: dbHealth ? 'connected' : 'disconnected'
    });
});

// Obtener perfil del doctor
app.get('/api/users/doctor/profile', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const doctorId = req.user.id;
        
        const doctorRepo = AppDataSource.getRepository(PerfilDoctor);
        const profile = await doctorRepo.findOne({
            where: { id: doctorId },
            relations: ['especialidad', 'cuenta']
        });

        if (!profile) {
            return ResponseHandler.notFound(res, 'Perfil de doctor no encontrado');
        }

        const profileResponse = {
            id: profile.id,
            nombre: profile.nombre,
            especialidad: profile.especialidad,
            cedula_profesional: profile.cedulaProfesional,
            telefono: profile.telefono,
            telefono_1: profile.telefono1,
            telefono_2: profile.telefono2,
            email: profile.cuenta?.email
        };

        ResponseHandler.success(res, profileResponse);

    } catch (error) {
        console.error('Error getting doctor profile:', error);
        ResponseHandler.internalError(res, 'Error obteniendo el perfil');
    }
});

// Actualizar perfil del doctor
app.put('/api/users/doctor/profile', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const doctorId = req.user.id;
        const updates = req.body;
        
        const doctorRepo = AppDataSource.getRepository(PerfilDoctor);
        const doctor = await doctorRepo.findOne({
            where: { id: doctorId }
        });

        if (!doctor) {
            return ResponseHandler.notFound(res, 'Doctor no encontrado');
        }

        // Actualizar campos permitidos
        const allowedFields = ['nombre', 'especialidad_id', 'cedula_profesional', 'telefono', 'telefono_1', 'telefono_2'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                (doctor as any)[field] = updates[field];
            }
        });

        doctor.updatedAt = new Date();
        await doctorRepo.save(doctor);

        // Obtener perfil actualizado con relaciones
        const updatedProfile = await doctorRepo.findOne({
            where: { id: doctorId },
            relations: ['especialidad', 'cuenta']
        });

        const profileResponse = {
            id: updatedProfile!.id,
            nombre: updatedProfile!.nombre,
            especialidad: updatedProfile!.especialidad,
            cedula_profesional: updatedProfile!.cedulaProfesional,
            telefono: updatedProfile!.telefono,
            telefono_1: updatedProfile!.telefono1,
            telefono_2: updatedProfile!.telefono2,
            email: updatedProfile!.cuenta?.email
        };

        ResponseHandler.success(res, profileResponse, 'Perfil actualizado exitosamente');

    } catch (error) {
        console.error('Error updating doctor profile:', error);
        ResponseHandler.internalError(res, 'Error actualizando el perfil');
    }
});

// Catálogo de especialidades
app.get('/api/catalog/specialties', async (req, res) => {
    try {
        const specialtiesRepo = AppDataSource.getRepository(Especialidad);
        const specialties = await specialtiesRepo.find({
            order: { nombre: 'ASC' }
        });

        ResponseHandler.success(res, specialties);

    } catch (error) {
        console.error('Error getting specialties:', error);
        ResponseHandler.internalError(res, 'Error obteniendo especialidades');
    }
});

// Catálogo de géneros
app.get('/api/catalog/genders', async (req, res) => {
    try {
        const gendersRepo = AppDataSource.getRepository(Genero);
        const genders = await gendersRepo.find({
            order: { nombre: 'ASC' }
        });

        ResponseHandler.success(res, genders);

    } catch (error) {
        console.error('Error getting genders:', error);
        ResponseHandler.internalError(res, 'Error obteniendo géneros');
    }
});

// Inicializar servidor
const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('✅ PostgreSQL conectado para User Service');
        
        app.listen(PORT, () => {
            console.log(`🚀 User Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting User Service:', error);
        process.exit(1);
    }
};

startServer();