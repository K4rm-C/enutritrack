// shared/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({
            success: false,
            error: 'Datos de entrada inválidos',
            details: errors.array()
        });
    };
};

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Datos de entrada inválidos',
            details: errors.array()
        });
    }
    next();
};

// Validaciones comunes
export const commonValidations = {
    email: {
        isEmail: true,
        normalizeEmail: true,
        errorMessage: 'Debe ser un email válido'
    },
    password: {
        isLength: {
            options: { min: 6 },
            errorMessage: 'La contraseña debe tener al menos 6 caracteres'
        }
    },
    uuid: {
        isUUID: true,
        errorMessage: 'Debe ser un UUID válido'
    },
    date: {
        isISO8601: true,
        errorMessage: 'Debe ser una fecha válida en formato ISO8601'
    },
    positiveNumber: {
        isFloat: {
            options: { min: 0 },
            errorMessage: 'Debe ser un número positivo'
        }
    }
};