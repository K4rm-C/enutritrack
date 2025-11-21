// src/medical-history/medical-history.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CouchbaseService } from '../couchbase/couchbase.service';

@Injectable()
export class MedicalHistoryService {
  constructor(private readonly couchbaseService: CouchbaseService) {}

  async create(createMedicalHistoryDto: any): Promise<any> {
    try {
      const documentId = `medical_history::${createMedicalHistoryDto.pacienteId}`;

      const medicalHistory = {
        id: documentId,
        ...createMedicalHistoryDto,
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

      const updatedHistory = {
        ...existingHistory,
        ...updateMedicalHistoryDto,
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
