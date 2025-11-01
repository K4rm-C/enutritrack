    // shared/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { redisClient } from '../../shared/utils/redis';

export interface AuthenticatedRequest extends Request {
    user?: any;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Token de acceso requerido'
        });
    }

    try {
        // Verificar en Redis primero
        const cachedUser = await redisClient.get(`token:${token}`);
        if (cachedUser) {
            req.user = JSON.parse(cachedUser);
            return next();
        }

        // Si no está en Redis, verificar JWT
        const user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        
        // Guardar en Redis para próximas requests
        await redisClient.set(`token:${token}`, JSON.stringify(user), { EX: 86400 });
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({
            success: false,
            error: 'Token inválido o expirado'
        });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }

        if (!roles.includes(req.user.tipo)) {
            return res.status(403).json({
                success: false,
                error: 'No tiene permisos para realizar esta acción'
            });
        }

        next();
    };
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    try {
        const cachedUser = await redisClient.get(`token:${token}`);
        if (cachedUser) {
            req.user = JSON.parse(cachedUser);
            return next();
        }

        const user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        req.user = user;
        next();
    } catch (error) {
        // Si el token es inválido, continuar sin usuario
        next();
    }
};