// shared/utils/response.ts
import { Response } from 'express';

/**
 * Interfaz para respuestas estándar
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Clase para manejar respuestas consistentes
 */
export class ResponseHandler {
    /**
     * Respuesta exitosa
     */
    static success<T>(res: Response, data?: T, message?: string, statusCode: number = 200): Response {
        const response: ApiResponse<T> = {
            success: true,
            data,
            message
        };

        return res.status(statusCode).json(response);
    }

    /**
     * Respuesta de creación exitosa
     */
    static created<T>(res: Response, data?: T, message: string = 'Recurso creado exitosamente'): Response {
        return this.success(res, data, message, 201);
    }

    /**
     * Respuesta de error
     */
    static error(res: Response, error: string, statusCode: number = 400): Response {
        const response: ApiResponse = {
            success: false,
            error
        };

        return res.status(statusCode).json(response);
    }

    /**
     * Respuesta no encontrada
     */
    static notFound(res: Response, message: string = 'Recurso no encontrado'): Response {
        return this.error(res, message, 404);
    }

    /**
     * Respuesta no autorizada
     */
    static unauthorized(res: Response, message: string = 'No autorizado'): Response {
        return this.error(res, message, 401);
    }

    /**
     * Respuesta prohibida
     */
    static forbidden(res: Response, message: string = 'Acceso prohibido'): Response {
        return this.error(res, message, 403);
    }

    /**
     * Error interno del servidor
     */
    static internalError(res: Response, message: string = 'Error interno del servidor'): Response {
        return this.error(res, message, 500);
    }

    /**
     * Respuesta con paginación
     */
    static paginated<T>(
        res: Response, 
        data: T[], 
        page: number, 
        limit: number, 
        total: number,
        message?: string
    ): Response {
        const totalPages = Math.ceil(total / limit);
        
        const response: ApiResponse<T[]> = {
            success: true,
            data,
            message,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };

        return res.status(200).json(response);
    }

    /**
     * Respuesta sin contenido
     */
    static noContent(res: Response): Response {
        return res.status(204).send();
    }

    /**
     * Respuesta aceptada (procesamiento asíncrono)
     */
    static accepted(res: Response, message: string = 'Solicitud aceptada para procesamiento'): Response {
        const response: ApiResponse = {
            success: true,
            message
        };

        return res.status(202).json(response);
    }

    /**
     * Respuesta en formato XML
     */
    static xml(res: Response, data: any, rootName: string = 'response'): Response {
        const { convertJsonToXml } = require('./xmlParser');
        const xml = convertJsonToXml({ success: true, data }, rootName);
        
        res.set('Content-Type', 'application/xml');
        return res.send(xml);
    }

    /**
     * Error en formato XML
     */
    static xmlError(res: Response, error: string, code: number = 400): Response {
        const { formatXmlError } = require('./xmlParser');
        const xml = formatXmlError(error, code);
        
        res.set('Content-Type', 'application/xml');
        return res.status(code).send(xml);
    }
}

/**
 * Funciones de conveniencia para respuestas comunes
 */
export const responseUtils = {
    // Respuestas para operaciones CRUD
    created: (res: Response, data: any, message?: string) => 
        ResponseHandler.created(res, data, message),

    updated: (res: Response, data: any, message: string = 'Recurso actualizado exitosamente') => 
        ResponseHandler.success(res, data, message),

    deleted: (res: Response, message: string = 'Recurso eliminado exitosamente') => 
        ResponseHandler.success(res, undefined, message),

    // Respuestas para validación
    validationError: (res: Response, errors: any[]) => 
        ResponseHandler.error(res, 'Datos de entrada inválidos', 400),

    // Respuestas para autenticación
    invalidCredentials: (res: Response) => 
        ResponseHandler.error(res, 'Credenciales inválidas', 401),

    tokenRequired: (res: Response) => 
        ResponseHandler.error(res, 'Token de acceso requerido', 401),

    tokenExpired: (res: Response) => 
        ResponseHandler.error(res, 'Token expirado', 401),

    // Respuestas para permisos
    insufficientPermissions: (res: Response) => 
        ResponseHandler.error(res, 'Permisos insuficientes', 403)
};