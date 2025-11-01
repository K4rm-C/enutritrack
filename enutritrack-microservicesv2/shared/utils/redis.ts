// shared/utils/redis.ts
import { createClient, RedisClientType } from 'redis';

// Configuración de Redis
const redisConfig = {
    url: `redis://${'localhost'}:${'6379'}`,
    password: '',
    socket: {
        reconnectStrategy: (retries: number) => {
            if (retries > 10) {
                console.log('❌ Demasiados intentos de reconexión a Redis');
                return new Error('Demasiados intentos de reconexión');
            }
            return Math.min(retries * 100, 3000);
        }
    }
};

// Crear cliente Redis
export const redisClient: RedisClientType = createClient(redisConfig);

// Manejar eventos de conexión
redisClient.on('connect', () => {
    console.log('✅ Conectado a Redis');
});

redisClient.on('error', (err) => {
    console.error('❌ Error de Redis:', err);
});

redisClient.on('reconnecting', () => {
    console.log('🔄 Reconectando a Redis...');
});

// Conectar a Redis
export const connectRedis = async (): Promise<void> => {
    try {
        await redisClient.connect();
        console.log('✅ Redis conectado exitosamente');
    } catch (error) {
        console.error('❌ Error conectando a Redis:', error);
        throw error;
    }
};

// Promisified utilities (ya no son necesarias porque Redis v4+ usa promesas nativamente)
// Pero las mantenemos para compatibilidad con el código existente
export const redisUtils = {
    get: async (key: string): Promise<string | null> => {
        try {
            return await redisClient.get(key);
        } catch (err) {
            console.error('Error en redis get:', err);
            throw err;
        }
    },

    set: async (key: string, value: string, expireSeconds?: number): Promise<void> => {
        try {
            if (expireSeconds) {
                await redisClient.set(key, value, { EX: expireSeconds });
            } else {
                await redisClient.set(key, value);
            }
        } catch (err) {
            console.error('Error en redis set:', err);
            throw err;
        }
    },

    del: async (key: string): Promise<void> => {
        try {
            await redisClient.del(key);
        } catch (err) {
            console.error('Error en redis del:', err);
            throw err;
        }
    },

    exists: async (key: string): Promise<boolean> => {
        try {
            const result = await redisClient.exists(key);
            return result === 1;
        } catch (err) {
            console.error('Error en redis exists:', err);
            throw err;
        }
    },

    expire: async (key: string, seconds: number): Promise<void> => {
        try {
            await redisClient.expire(key, seconds);
        } catch (err) {
            console.error('Error en redis expire:', err);
            throw err;
        }
    },

    ttl: async (key: string): Promise<number> => {
        try {
            return await redisClient.ttl(key);
        } catch (err) {
            console.error('Error en redis ttl:', err);
            throw err;
        }
    },

    // Hash operations
    hset: async (key: string, field: string, value: string): Promise<void> => {
        try {
            await redisClient.hSet(key, field, value);
        } catch (err) {
            console.error('Error en redis hset:', err);
            throw err;
        }
    },

    hget: async (key: string, field: string): Promise<string | null> => {
        try {
            return await redisClient.hGet(key, field);
        } catch (err) {
            console.error('Error en redis hget:', err);
            throw err;
        }
    },

    hgetall: async (key: string): Promise<{ [key: string]: string }> => {
        try {
            const result = await redisClient.hGetAll(key);
            return result || {};
        } catch (err) {
            console.error('Error en redis hgetall:', err);
            throw err;
        }
    },

    // List operations
    lpush: async (key: string, value: string): Promise<void> => {
        try {
            await redisClient.lPush(key, value);
        } catch (err) {
            console.error('Error en redis lpush:', err);
            throw err;
        }
    },

    lrange: async (key: string, start: number, stop: number): Promise<string[]> => {
        try {
            return await redisClient.lRange(key, start, stop);
        } catch (err) {
            console.error('Error en redis lrange:', err);
            throw err;
        }
    },

    // Set operations
    sadd: async (key: string, value: string): Promise<void> => {
        try {
            await redisClient.sAdd(key, value);
        } catch (err) {
            console.error('Error en redis sadd:', err);
            throw err;
        }
    },

    smembers: async (key: string): Promise<string[]> => {
        try {
            return await redisClient.sMembers(key);
        } catch (err) {
            console.error('Error en redis smembers:', err);
            throw err;
        }
    },

    // Increment operations
    incr: async (key: string): Promise<number> => {
        try {
            return await redisClient.incr(key);
        } catch (err) {
            console.error('Error en redis incr:', err);
            throw err;
        }
    },

    incrby: async (key: string, increment: number): Promise<number> => {
        try {
            return await redisClient.incrBy(key, increment);
        } catch (err) {
            console.error('Error en redis incrby:', err);
            throw err;
        }
    },

    // Additional useful methods
    keys: async (pattern: string): Promise<string[]> => {
        try {
            return await redisClient.keys(pattern);
        } catch (err) {
            console.error('Error en redis keys:', err);
            throw err;
        }
    },

    flushall: async (): Promise<void> => {
        try {
            await redisClient.flushAll();
        } catch (err) {
            console.error('Error en redis flushall:', err);
            throw err;
        }
    },

    // Pipeline operations for better performance
    multi: () => {
        return redisClient.multi();
    }
};

// Funciones de cache específicas para la aplicación
export const cacheUtils = {
    // Cache de usuarios
    setUser: async (userId: string, userData: any): Promise<void> => {
        const key = `user:${userId}`;
        await redisUtils.set(key, JSON.stringify(userData), 3600); // 1 hora
    },

    getUser: async (userId: string): Promise<any> => {
        const key = `user:${userId}`;
        const data = await redisUtils.get(key);
        return data ? JSON.parse(data) : null;
    },

    // Cache de pacientes del doctor
    setDoctorPatients: async (doctorId: string, patients: any[]): Promise<void> => {
        const key = `doctor:${doctorId}:patients`;
        await redisUtils.set(key, JSON.stringify(patients), 1800); // 30 minutos
    },

    getDoctorPatients: async (doctorId: string): Promise<any[]> => {
        const key = `doctor:${doctorId}:patients`;
        const data = await redisUtils.get(key);
        return data ? JSON.parse(data) : [];
    },

    // Cache de catálogos
    setCatalog: async (catalogName: string, data: any): Promise<void> => {
        const key = `catalog:${catalogName}`;
        await redisUtils.set(key, JSON.stringify(data), 86400); // 24 horas
    },

    getCatalog: async (catalogName: string): Promise<any> => {
        const key = `catalog:${catalogName}`;
        const data = await redisUtils.get(key);
        return data ? JSON.parse(data) : null;
    },

    // Invalidar cache
    invalidateUser: async (userId: string): Promise<void> => {
        const key = `user:${userId}`;
        await redisUtils.del(key);
    },

    invalidateDoctorPatients: async (doctorId: string): Promise<void> => {
        const key = `doctor:${doctorId}:patients`;
        await redisUtils.del(key);
    },

    // Cache de tokens
    setToken: async (token: string, userData: any): Promise<void> => {
        const key = `token:${token}`;
        await redisUtils.set(key, JSON.stringify(userData), 86400); // 24 horas
    },

    getToken: async (token: string): Promise<any> => {
        const key = `token:${token}`;
        const data = await redisUtils.get(key);
        return data ? JSON.parse(data) : null;
    },

    deleteToken: async (token: string): Promise<void> => {
        const key = `token:${token}`;
        await redisUtils.del(key);
    },

    // Cache para datos específicos de la aplicación
    setAppData: async (key: string, data: any, ttlSeconds: number = 3600): Promise<void> => {
        await redisUtils.set(`app:${key}`, JSON.stringify(data), ttlSeconds);
    },

    getAppData: async (key: string): Promise<any> => {
        const data = await redisUtils.get(`app:${key}`);
        return data ? JSON.parse(data) : null;
    },

    // Invalidar múltiples keys por patrón
    invalidateByPattern: async (pattern: string): Promise<void> => {
        try {
            const keys = await redisUtils.keys(pattern);
            if (keys.length > 0) {
                const multi = redisUtils.multi();
                keys.forEach(key => multi.del(key));
                await multi.exec();
            }
        } catch (err) {
            console.error('Error invalidando cache por patrón:', err);
        }
    },

    // Health check de Redis
    healthCheck: async (): Promise<boolean> => {
        try {
            await redisUtils.set('healthcheck', 'ok', 10);
            const result = await redisUtils.get('healthcheck');
            return result === 'ok';
        } catch (err) {
            console.error('Redis health check failed:', err);
            return false;
        }
    }
};

// Inicializar conexión cuando se importe el módulo
connectRedis().catch(console.error);