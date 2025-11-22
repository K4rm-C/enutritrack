// src/medical-history/medical-history.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CouchbaseService } from '../couchbase/couchbase.service';

@Injectable()
export class MedicalHistoryService {
  constructor(private readonly couchbaseService: CouchbaseService) {}

  async create(createMedicalHistoryDto: any): Promise<any> {
    try {
      const documentId = `medical_history::${createMedicalHistoryDto.usuarioId}`;

      // ✅ Asegurar que los arrays se guarden correctamente
      const medicalHistory = {
        id: documentId,
        condiciones: Array.isArray(createMedicalHistoryDto.condiciones)
          ? createMedicalHistoryDto.condiciones
          : [],
        alergias: Array.isArray(createMedicalHistoryDto.alergias)
          ? createMedicalHistoryDto.alergias
          : [],
        medicamentos: Array.isArray(createMedicalHistoryDto.medicamentos)
          ? createMedicalHistoryDto.medicamentos
          : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await this.couchbaseService.upsertDocument(documentId, medicalHistory);
      return medicalHistory;
    } catch (error) {
      console.error('Error creating medical history:', error);
      throw new HttpException(
        'Failed to create medical history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(usuarioId: string, updateMedicalHistoryDto: any): Promise<any> {
    try {
      const documentId = `medical_history::${usuarioId}`;
      const existingHistory =
        await this.couchbaseService.getDocument(documentId);

      if (!existingHistory) {
        throw new HttpException(
          'Medical history not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // ✅ Asegurar que los arrays se actualicen correctamente
      const updatedHistory = {
        ...existingHistory,
        condiciones: Array.isArray(updateMedicalHistoryDto.condiciones)
          ? updateMedicalHistoryDto.condiciones
          : existingHistory.condiciones,
        alergias: Array.isArray(updateMedicalHistoryDto.alergias)
          ? updateMedicalHistoryDto.alergias
          : existingHistory.alergias,
        medicamentos: Array.isArray(updateMedicalHistoryDto.medicamentos)
          ? updateMedicalHistoryDto.medicamentos
          : existingHistory.medicamentos,
        updated_at: new Date().toISOString(),
      };

      await this.couchbaseService.upsertDocument(documentId, updatedHistory);
      return updatedHistory;
    } catch (error) {
      console.error('Error updating medical history:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to update medical history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByUser(usuarioId: string): Promise<any> {
    try {
      const documentId = `medical_history::${usuarioId}`;
      const medicalHistory =
        await this.couchbaseService.getDocument(documentId);

      if (!medicalHistory) {
        throw new HttpException(
          'Medical history not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return medicalHistory;
    } catch (error) {
      console.error('Error fetching medical history:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to fetch medical history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async healthCheck() {
    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      service: 'Medical History Service (Couchbase)',
      version: '2.0.0',
      description: 'Almacena resúmenes rápidos de historial médico',
    };
  }
}
