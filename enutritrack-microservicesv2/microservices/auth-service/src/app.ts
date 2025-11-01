// microservices/auth-service/src/app.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from '../../../shared/database/postgres';
import { cacheUtils } from '../../../shared/utils/redis';
import { Cuenta } from '../../../shared/entities/Cuenta';
import { authenticateToken } from '../../../shared/middleware/auth';
import { ResponseHandler } from '../../../shared/utils/response';

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración JWT
const JWT_CONFIG = {
    SECRET: String(process.env.JWT_SECRET || 'fallback-secret-development'),
    EXPIRES_IN: '24h'
} as const;

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
        service: 'auth-service',
        database: dbHealth ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, tipo = 'doctor' } = req.body;
        
        if (!email || !password) {
            return ResponseHandler.error(res, 'Email y contraseña son requeridos', 400);
        }

        // Buscar cuenta en la base de datos
        const cuentaRepo = AppDataSource.getRepository(Cuenta);
        const cuenta = await cuentaRepo.findOne({ 
            where: { email, activa: true },
            relations: tipo === 'doctor' ? ['perfilDoctor'] : ['perfilUsuario']
        });

        if (!cuenta) {
            return ResponseHandler.error(res, 'Credenciales inválidas', 401);
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, cuenta.passwordHash);
        if (!isValidPassword) {
            return ResponseHandler.error(res, 'Credenciales inválidas', 401);
        }

        // Obtener perfil según el tipo
        let userProfile;
        if (tipo === 'doctor' && cuenta.perfilDoctor) {
            userProfile = cuenta.perfilDoctor;
        } else if (tipo === 'patient' && cuenta.perfilUsuario) {
            userProfile = cuenta.perfilUsuario;
        } else {
            return ResponseHandler.error(res, 'Tipo de cuenta no válido', 401);
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: userProfile.id, 
                email: cuenta.email, 
                tipo: tipo,
                nombre: userProfile.nombre 
            }, 
            JWT_CONFIG.SECRET,
            { expiresIn: JWT_CONFIG.EXPIRES_IN }
        );

        // Actualizar último acceso
        cuenta.ultimoAcceso = new Date();
        await cuentaRepo.save(cuenta);

        // Guardar en Redis
        await cacheUtils.setToken(token, {
            id: userProfile.id,
            email: cuenta.email,
            tipo: tipo,
            nombre: userProfile.nombre
        });

        const userResponse = {
            id: userProfile.id,
            email: cuenta.email,
            nombre: userProfile.nombre,
            tipo: tipo
        };

        ResponseHandler.success(res, { token, user: userResponse });

    } catch (error) {
        console.error('Login error:', error);
        ResponseHandler.internalError(res, 'Error interno del servidor');
    }
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, (req: any, res: express.Response) => {
    ResponseHandler.success(res, { user: req.user });
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req: any, res: express.Response) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (token) {
            await cacheUtils.deleteToken(token);
        }
        ResponseHandler.success(res, null, 'Sesión cerrada exitosamente');
    } catch (error) {
        ResponseHandler.internalError(res, 'Error al cerrar sesión');
    }
});

// Inicializar servidor
const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('✅ PostgreSQL conectado para Auth Service');
        
        app.listen(PORT, () => {
            console.log(`🚀 Auth Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting Auth Service:', error);
        process.exit(1);
    }
};

startServer();