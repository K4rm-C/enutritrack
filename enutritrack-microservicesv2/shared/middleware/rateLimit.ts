// shared/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import { redisClient } from '../../shared/utils/redis';
import { Request, Response } from 'express';

// Store para rate limiting con Redis
const redisStore = {
    incr: async (key: string, callback: (err: any, hits: number) => void) => {
        try {
            const hits = await redisClient.incr(key);
            await redisClient.expire(key, 60); // Expirar en 60 segundos
            callback(null, hits);
        } catch (error) {
            callback(error, 0);
        }
    }
};

export const generalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 requests por ventana
    message: {
        success: false,
        error: 'Demasiadas requests desde esta IP, por favor intente más tarde'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // store: redisStore // Descomentar cuando Redis esté configurado
});

export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Límite de 5 intentos de login
    message: {
        success: false,
        error: 'Demasiados intentos de login, por favor intente más tarde'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // store: redisStore
});

export const apiRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 60, // Límite de 60 requests por minuto
    message: {
        success: false,
        error: 'Demasiadas requests a la API, por favor reduzca la frecuencia'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // store: redisStore
});

// Rate limiting dinámico basado en el usuario
export const userAwareRateLimit = (maxRequests: number = 100) => {
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        max: (req: Request) => {
            // Usuarios autenticados tienen límites más altos
            return (req as any).user ? maxRequests * 2 : maxRequests;
        },
        keyGenerator: (req: Request) => {
            // Usar user ID si está autenticado, sino IP
            return (req as any).user ? (req as any).user.id : req.ip;
        },
        message: {
            success: false,
            error: 'Límite de requests excedido'
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};