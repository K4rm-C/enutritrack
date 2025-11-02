// shared/utils/index.ts
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

/**
 * Genera un UUID único
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * Hashea una contraseña
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verifica una contraseña contra un hash
 */
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Formatea una fecha a string legible
 */
export const formatDate = (
  date: Date | string,
  includeTime: boolean = true
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  return dateObj.toLocaleDateString("es-ES", options);
};

/**
 * Calcula la edad a partir de la fecha de nacimiento
 */
export const calculateAge = (birthDate: Date | string): number => {
  const today = new Date();
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Sanitiza un string para prevenir XSS
 */
export const sanitizeString = (str: string): string => {
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Valida un email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida un teléfono
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Genera un código aleatorio
 */
export const generateRandomCode = (length: number = 6): string => {
  const chars = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Calcula las calorías quemadas en una actividad
 */
export const calculateCaloriesBurned = (
  metValue: number,
  weight: number,
  durationMinutes: number
): number => {
  // Fórmula: MET * peso (kg) * tiempo (horas)
  const durationHours = durationMinutes / 60;
  return Math.round(metValue * weight * durationHours);
};

/**
 * Calcula el IMC (Índice de Masa Corporal)
 */
export const calculateBMI = (weight: number, height: number): number => {
  // Altura en metros al cuadrado
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

/**
 * Interpreta el IMC
 */
export const interpretBMI = (
  bmi: number
): { category: string; risk: string } => {
  if (bmi < 18.5) {
    return { category: "Bajo peso", risk: "Aumentado" };
  } else if (bmi < 25) {
    return { category: "Peso normal", risk: "Promedio" };
  } else if (bmi < 30) {
    return { category: "Sobrepeso", risk: "Aumentado" };
  } else if (bmi < 35) {
    return { category: "Obesidad grado I", risk: "Moderado" };
  } else if (bmi < 40) {
    return { category: "Obesidad grado II", risk: "Severo" };
  } else {
    return { category: "Obesidad grado III", risk: "Muy severo" };
  }
};

/**
 * Retrasa la ejecución (sleep)
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Convierte un objeto a query string
 */
export const objectToQueryString = (obj: any): string => {
  const params = new URLSearchParams();
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined && obj[key] !== null) {
      params.append(key, obj[key].toString());
    }
  });
  return params.toString();
};

/**
 * Deep clone de un objeto
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as any;
  }

  if (typeof obj === "object") {
    const clonedObj = {} as T;
    Object.keys(obj).forEach((key) => {
      clonedObj[key as keyof T] = deepClone(obj[key as keyof T]);
    });
    return clonedObj;
  }

  return obj;
};

/**
 * Capitaliza la primera letra de cada palabra
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
