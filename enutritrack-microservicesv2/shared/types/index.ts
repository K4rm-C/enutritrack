// shared/types/index.ts
export interface User {
  id: string;
  email: string;
  nombre: string;
  tipo: 'doctor' | 'patient';
}

export interface Cuenta {
  id: string;
  email: string;
  email_1?: string;
  email_2?: string;
  password_hash: string;
  tipo_cuenta: 'doctor' | 'patient' | 'admin';
  activa: boolean;
  ultimo_acceso?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DoctorProfile {
  id: string;
  cuenta_id: string;
  admin_id?: string;
  nombre: string;
  especialidad_id?: string;
  cedula_profesional?: string;
  telefono?: string;
  telefono_1?: string;
  telefono_2?: string;
  created_at: Date;
  updated_at: Date;
  especialidad?: Especialidad;
  cuenta?: Cuenta;
}

export interface PatientProfile {
  id: string;
  cuenta_id: string;
  doctor_id?: string;
  nombre: string;
  fecha_nacimiento: Date;
  genero_id: string;
  altura: number;
  telefono?: string;
  telefono_1?: string;
  telefono_2?: string;
  created_at: Date;
  updated_at: Date;
  genero?: Genero;
  doctor?: DoctorProfile;
  cuenta?: Cuenta;
}

export interface AdminProfile {
  id: string;
  cuenta_id: string;
  nombre: string;
  departamento?: string;
  telefono?: string;
  telefono_1?: string;
  telefono_2?: string;
  created_at: Date;
  updated_at: Date;
  cuenta?: Cuenta;
}

export interface Especialidad {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at: Date;
}

export interface Genero {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at: Date;
}

export interface MedicalCondition {
  id: string;
  usuario_id: string;
  nombre: string;
  severidad: 'leve' | 'moderada' | 'grave';
  fecha_diagnostico?: Date;
  notas?: string;
  activa: boolean;
  created_at: Date;
  updated_at: Date;
  usuario?: PatientProfile;
}

export interface Alergia {
  id: string;
  usuario_id: string;
  tipo?: string;
  nombre: string;
  severidad: 'leve' | 'moderada' | 'grave' | 'severa';
  reaccion?: string;
  notas?: string;
  activa: boolean;
  created_at: Date;
  updated_at: Date;
  usuario?: PatientProfile;
}

export interface Medicamento {
  id: string;
  usuario_id: string;
  nombre: string;
  dosis?: string;
  frecuencia?: string;
  fecha_inicio: Date;
  fecha_fin?: Date;
  notas?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  usuario?: PatientProfile;
}

export interface HistorialPeso {
  id: string;
  usuario_id: string;
  peso: number;
  fecha_registro: Date;
  notas?: string;
  usuario?: PatientProfile;
}

export interface ObjetivoUsuario {
  id: string;
  usuario_id: string;
  peso_objetivo?: number;
  nivel_actividad: 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';
  fecha_establecido: Date;
  vigente: boolean;
  usuario?: PatientProfile;
}

export interface CitaMedica {
  id: string;
  usuario_id: string;
  doctor_id: string;
  tipo_consulta_id: string;
  estado_cita_id: string;
  fecha_hora_programada: Date;
  fecha_hora_inicio?: Date;
  fecha_hora_fin?: Date;
  motivo?: string;
  observaciones?: string;
  diagnostico?: string;
  tratamiento_recomendado?: string;
  proxima_cita_sugerida?: Date;
  created_at: Date;
  updated_at: Date;
  usuario?: PatientProfile;
  doctor?: DoctorProfile;
  tipo_consulta?: TipoConsulta;
  estado_cita?: EstadoCita;
  signos_vitales?: CitaSignosVitales[];
  documentos?: CitaDocumento[];
}

export interface CitaSignosVitales {
  id: string;
  cita_medica_id: string;
  peso?: number;
  altura?: number;
  tension_arterial_sistolica?: number;
  tension_arterial_diastolica?: number;
  frecuencia_cardiaca?: number;
  temperatura?: number;
  saturacion_oxigeno?: number;
  notas?: string;
  created_at: Date;
  cita_medica?: CitaMedica;
}

export interface CitaDocumento {
  id: string;
  cita_medica_id: string;
  nombre_archivo: string;
  tipo_documento?: string;
  ruta_archivo: string;
  tamano_bytes?: number;
  notas?: string;
  created_at: Date;
  cita_medica?: CitaMedica;
}

export interface TipoConsulta {
  id: string;
  nombre: string;
  descripcion?: string;
  duracion_minutos: number;
  created_at: Date;
}

export interface EstadoCita {
  id: string;
  nombre: string;
  descripcion?: string;
  es_final: boolean;
  created_at: Date;
}

export interface Alerta {
  id: string;
  usuario_id: string;
  doctor_id?: string;
  tipo_alerta_id: string;
  nivel_prioridad_id: string;
  estado_alerta_id: string;
  titulo: string;
  mensaje: string;
  recomendacion_id?: string;
  fecha_deteccion: Date;
  fecha_resolucion?: Date;
  resuelta_por?: string;
  notas_resolucion?: string;
  created_at: Date;
  updated_at: Date;
  usuario?: PatientProfile;
  doctor?: DoctorProfile;
  tipo_alerta?: TipoAlerta;
  nivel_prioridad?: NivelPrioridadAlerta;
  estado_alerta?: EstadoAlerta;
  recomendacion?: Recomendacion;
  acciones?: AlertaAccion[];
}

export interface AlertaAccion {
  id: string;
  alerta_id: string;
  doctor_id: string;
  accion_tomada: string;
  descripcion?: string;
  fecha_accion: Date;
  alerta?: Alerta;
  doctor?: DoctorProfile;
}

export interface TipoAlerta {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria_id: string;
  es_automatica: boolean;
  config_validacion?: any;
  created_at: Date;
  categoria?: CategoriaAlerta;
}

export interface CategoriaAlerta {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at: Date;
}

export interface NivelPrioridadAlerta {
  id: string;
  nombre: string;
  descripcion?: string;
  nivel_numerico: number;
  created_at: Date;
}

export interface EstadoAlerta {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at: Date;
}

export interface ConfiguracionAlertaAutomatica {
  id: string;
  usuario_id: string;
  tipo_alerta_id: string;
  doctor_id?: string;
  esta_activa: boolean;
  umbral_configuracion?: any;
  frecuencia_verificacion_horas: number;
  created_at: Date;
  updated_at: Date;
  usuario?: PatientProfile;
  tipo_alerta?: TipoAlerta;
  doctor?: DoctorProfile;
}

export interface Alimento {
  id: string;
  nombre: string;
  descripcion?: string;
  calorias_por_100g: number;
  proteinas_g_por_100g: number;
  carbohidratos_g_por_100g: number;
  grasas_g_por_100g: number;
  fibra_g_por_100g?: number;
  categoria?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RegistroComida {
  id: string;
  usuario_id: string;
  fecha: Date;
  tipo_comida: 'desayuno' | 'almuerzo' | 'cena' | 'merienda';
  notas?: string;
  created_at: Date;
  updated_at: Date;
  usuario?: PatientProfile;
  items?: RegistroComidaItem[];
}

export interface RegistroComidaItem {
  id: string;
  registro_comida_id: string;
  alimento_id: string;
  cantidad_gramos: number;
  calorias: number;
  proteinas_g: number;
  carbohidratos_g: number;
  grasas_g: number;
  fibra_g?: number;
  notas?: string;
  created_at: Date;
  registro_comida?: RegistroComida;
  alimento?: Alimento;
}

export interface ActividadFisica {
  id: string;
  usuario_id: string;
  tipo_actividad_id: string;
  duracion_min: number;
  calorias_quemadas: number;
  intensidad?: string;
  notas?: string;
  fecha: Date;
  created_at: Date;
  usuario?: PatientProfile;
  tipo_actividad?: TipoActividad;
}

export interface TipoActividad {
  id: string;
  nombre: string;
  descripcion?: string;
  met_value: number;
  categoria?: string;
  created_at: Date;
}

export interface Recomendacion {
  id: string;
  usuario_id: string;
  tipo_recomendacion_id: string;
  contenido: string;
  fecha_generacion: Date;
  vigencia_hasta?: Date;
  activa: boolean;
  prioridad?: string;
  cita_medica_id?: string;
  alerta_generadora_id?: string;
  created_at: Date;
  usuario?: PatientProfile;
  tipo_recomendacion?: TipoRecomendacion;
  cita_medica?: CitaMedica;
  alerta_generadora?: Alerta;
  datos?: RecomendacionDato[];
}

export interface RecomendacionDato {
  id: string;
  recomendacion_id: string;
  clave: string;
  valor: string;
  tipo_dato?: string;
  created_at: Date;
  recomendacion?: Recomendacion;
}

export interface TipoRecomendacion {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  created_at: Date;
}

// Enums
export type TipoCuentaEnum = 'doctor' | 'patient' | 'admin';
export type AlergiaSeveridadEnum = 'leve' | 'moderada' | 'grave' | 'severa';
export type CondicionMedicaSeveridadEnum = 'leve' | 'moderada' | 'grave';
export type RegistroComidaTipoEnum = 'desayuno' | 'almuerzo' | 'cena' | 'merienda';
export type NivelActividadEnum = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';

// Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
  tipo?: 'doctor' | 'patient';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}