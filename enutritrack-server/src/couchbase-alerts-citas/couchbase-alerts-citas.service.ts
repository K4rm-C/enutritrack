import { Injectable } from '@nestjs/common';
import { CouchbaseService } from '../couchbase/couchbase.service';

export interface CitaMedicaCompletaDocument {
  type: 'cita_medica_completa';
  id: string;
  usuario_id: string;
  doctor_id: string;
  cita_id_postgres: string;
  datos_basicos: {
    fecha_hora_programada: string;
    tipo_consulta: string;
    estado: string;
    motivo: string;
  };
  documentos_adjuntos: Array<{
    nombre: string;
    tipo_documento: string;
    ruta_couchbase: string;
    metadatos: {
      tamaño_bytes: number;
      content_type: string;
      fecha_subida: string;
    };
  }>;
  notas_doctor: string;
  observaciones_detalladas: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface AlertaContextoDocument {
  type: 'alerta_contexto';
  id: string;
  usuario_id: string;
  alerta_id_postgres: string;
  datos_generacion: {
    tipo_alerta: string;
    contexto_completo: {
      historial_pesos_reciente: Array<{
        fecha: string;
        peso: number;
        notas: string;
      }>;
      registros_nutricion: Array<{
        fecha: string;
        calorias_totales: number;
        tipo: string;
      }>;
      actividad_fisica: Array<{
        fecha: string;
        duracion_min: number;
        tipo: string;
      }>;
    };
    algoritmo_aplicado: {
      version: string;
      nombre: string;
      parametros: {
        umbral_porcentaje?: number;
        periodo_dias?: number;
        [key: string]: any;
      };
    };
    confianza_deteccion: number;
  };
  fecha_creacion: string;
}

@Injectable()
export class CouchbaseAlertsCitasService {
  constructor(private readonly couchbaseService: CouchbaseService) {}

  // Citas Médicas
  async createCitaMedicaCompleta(document: CitaMedicaCompletaDocument): Promise<void> {
    const key = `cita_medica:${document.id}`;
    await this.couchbaseService.upsertDocument(key, document);
  }

  async getCitaMedicaCompleta(citaId: string): Promise<CitaMedicaCompletaDocument | null> {
    const key = `cita_medica:${citaId}`;
    return await this.couchbaseService.getDocument(key);
  }

  async updateCitaMedicaCompleta(citaId: string, updates: Partial<CitaMedicaCompletaDocument>): Promise<void> {
    const existing = await this.getCitaMedicaCompleta(citaId);
    if (!existing) {
      throw new Error(`Cita médica ${citaId} no encontrada en Couchbase`);
    }

    const updated = {
      ...existing,
      ...updates,
      fecha_actualizacion: new Date().toISOString()
    };

    await this.createCitaMedicaCompleta(updated);
  }

  async deleteCitaMedicaCompleta(citaId: string): Promise<void> {
    const key = `cita_medica:${citaId}`;
    await this.couchbaseService.removeDocument(key);
  }

  async getCitasMedicasByUser(userId: string): Promise<CitaMedicaCompletaDocument[]> {
    // Nota: En una implementación real, usarías N1QL queries
    // Para simplificar, retornamos un array vacío - esto se implementaría
    // con queries N1QL más complejas
    return [];
  }

  // Alertas
  async createAlertaContexto(document: AlertaContextoDocument): Promise<void> {
    const key = `alerta_contexto:${document.id}`;
    await this.couchbaseService.upsertDocument(key, document);
  }

  async getAlertaContexto(alertaId: string): Promise<AlertaContextoDocument | null> {
    const key = `alerta_contexto:${alertaId}`;
    return await this.couchbaseService.getDocument(key);
  }

  async updateAlertaContexto(alertaId: string, updates: Partial<AlertaContextoDocument>): Promise<void> {
    const existing = await this.getAlertaContexto(alertaId);
    if (!existing) {
      throw new Error(`Contexto de alerta ${alertaId} no encontrado en Couchbase`);
    }

    const updated = {
      ...existing,
      ...updates
    };

    await this.createAlertaContexto(updated);
  }

  async deleteAlertaContexto(alertaId: string): Promise<void> {
    const key = `alerta_contexto:${alertaId}`;
    await this.couchbaseService.removeDocument(key);
  }

  async getAlertasContextoByUser(userId: string): Promise<AlertaContextoDocument[]> {
    // Nota: En una implementación real, usarías N1QL queries
    // Para simplificar, retornamos un array vacío - esto se implementaría
    // con queries N1QL más complejas
    return [];
  }

  // Métodos helper para generar IDs únicos
  generateCitaMedicaCompletaId(): string {
    return `cita_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateAlertaContextoId(): string {
    return `alerta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
