import {
  IsString,
  IsOptional,
  IsDate,
  IsUUID,
  IsNotEmpty,
  IsBoolean,
  IsObject,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO para crear alertas
export class CreateAlertDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El usuario es requerido' })
  usuario_id: string;

  @IsUUID()
  @IsOptional()
  doctor_id?: string;

  @IsUUID()
  @IsNotEmpty({ message: 'El tipo de alerta es requerido' })
  tipo_alerta_id: string;

  @IsUUID()
  @IsNotEmpty({ message: 'El nivel de prioridad es requerido' })
  nivel_prioridad_id: string;

  @IsUUID()
  @IsNotEmpty({ message: 'El estado de alerta es requerido' })
  estado_alerta_id: string;

  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  mensaje: string;

  @IsUUID()
  @IsOptional()
  recomendacion_id?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fecha_deteccion?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fecha_resolucion?: Date;

  @IsUUID()
  @IsOptional()
  resuelta_por?: string;

  @IsString()
  @IsOptional()
  notas_resolucion?: string;
}

// DTO para actualizar alertas
export class UpdateAlertDto {
  @IsUUID()
  @IsOptional()
  doctor_id?: string;

  @IsUUID()
  @IsOptional()
  estado_alerta_id?: string;

  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  mensaje?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fecha_resolucion?: Date;

  @IsUUID()
  @IsOptional()
  resuelta_por?: string;

  @IsString()
  @IsOptional()
  notas_resolucion?: string;
}

// DTO para acciones en alertas
export class CreateAlertActionDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El doctor es requerido' })
  doctor_id: string;

  @IsString()
  @IsNotEmpty({ message: 'La acción tomada es requerida' })
  accion_tomada: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fecha_accion?: Date;
}

// DTO para configuraciones automáticas de alertas
export class CreateAutomaticAlertConfigDto {
  @IsUUID()
  @IsNotEmpty({ message: 'El usuario es requerido' })
  usuario_id: string;

  @IsUUID()
  @IsNotEmpty({ message: 'El tipo de alerta es requerido' })
  tipo_alerta_id: string;

  @IsUUID()
  @IsOptional()
  doctor_id?: string;

  @IsBoolean()
  @IsOptional()
  esta_activa?: boolean;

  @IsObject()
  @IsOptional()
  umbral_configuracion?: any;

  @IsNumber()
  @Min(1, { message: 'La frecuencia debe ser al menos 1 hora' })
  @Max(744, { message: 'La frecuencia no puede exceder 744 horas (31 días)' })
  @IsOptional()
  frecuencia_verificacion_horas?: number;
}

// DTO para actualizar configuraciones automáticas
export class UpdateAutomaticAlertConfigDto {
  @IsBoolean()
  @IsOptional()
  esta_activa?: boolean;

  @IsObject()
  @IsOptional()
  umbral_configuracion?: any;

  @IsNumber()
  @Min(1, { message: 'La frecuencia debe ser al menos 1 hora' })
  @Max(744, { message: 'La frecuencia no puede exceder 744 horas (31 días)' })
  @IsOptional()
  frecuencia_verificacion_horas?: number;
}

// DTO para respuesta de alertas (opcional - para type safety en respuestas)
export class AlertResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  usuario_id: string;

  @IsUUID()
  @IsOptional()
  doctor_id?: string;

  @IsUUID()
  tipo_alerta_id: string;

  @IsUUID()
  nivel_prioridad_id: string;

  @IsUUID()
  estado_alerta_id: string;

  @IsString()
  titulo: string;

  @IsString()
  mensaje: string;

  @IsUUID()
  @IsOptional()
  recomendacion_id?: string;

  @IsDate()
  fecha_deteccion: Date;

  @IsDate()
  @IsOptional()
  fecha_resolucion?: Date;

  @IsUUID()
  @IsOptional()
  resuelta_por?: string;

  @IsString()
  @IsOptional()
  notas_resolucion?: string;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;

  @IsObject()
  @IsOptional()
  tipo_alerta?: any;

  @IsObject()
  @IsOptional()
  nivel_prioridad?: any;

  @IsObject()
  @IsOptional()
  estado_alerta?: any;

  @IsObject()
  @IsOptional()
  acciones?: any[];
}

// DTO para queries/filtros de alertas
export class AlertQueryDto {
  @IsUUID()
  @IsOptional()
  usuario_id?: string;

  @IsUUID()
  @IsOptional()
  doctor_id?: string;

  @IsUUID()
  @IsOptional()
  tipo_alerta_id?: string;

  @IsUUID()
  @IsOptional()
  estado_alerta_id?: string;

  @IsBoolean()
  @IsOptional()
  includeResolved?: boolean;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
