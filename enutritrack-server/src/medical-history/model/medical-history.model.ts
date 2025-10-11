// src/medical-history/entities/medical-history.model.ts
// NOTA: Medical History se almacena en Couchbase (NoSQL), no en PostgreSQL
// Las tablas 'alergias', 'condiciones_medicas' y 'medicamentos' en PostgreSQL
// almacenan datos detallados, mientras que este servicio almacena un resumen rapido.

export interface MedicalHistory {
  id: string;
  usuarioId: string;
  condiciones?: string[];
  alergias?: string[];
  medicamentos?: string[];
  created_at: string;
  updated_at: string;
}
