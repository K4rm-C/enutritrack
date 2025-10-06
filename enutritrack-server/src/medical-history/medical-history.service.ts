import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CouchbaseService } from '../couchbase/couchbase.service';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';

@Injectable()
export class MedicalHistoryService {
  constructor(private readonly couchbaseService: CouchbaseService) {}

  async create(createMedicalHistoryDto: CreateMedicalHistoryDto): Promise<any> {
    try {
      const documentId = `medical_history::${createMedicalHistoryDto.usuarioId}`;

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

  async update(
    usuarioId: string,
    updateMedicalHistoryDto: Partial<CreateMedicalHistoryDto>,
  ): Promise<any> {
    try {
      const documentId = `medical_history::${usuarioId}`;

      // Obtener documento existente
      const existingHistory =
        await this.couchbaseService.getDocument(documentId);

      if (!existingHistory) {
        throw new HttpException(
          'Medical history not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Actualizar documento
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

  async addCondition(usuarioId: string, condition: string): Promise<any> {
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
        condiciones: [...(existingHistory.condiciones || []), condition],
        updated_at: new Date().toISOString(),
      };

      await this.couchbaseService.upsertDocument(documentId, updatedHistory);

      return updatedHistory;
    } catch (error) {
      console.error('Error adding condition:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to add condition',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addAllergy(usuarioId: string, allergy: string): Promise<any> {
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
        alergias: [...(existingHistory.alergias || []), allergy],
        updated_at: new Date().toISOString(),
      };

      await this.couchbaseService.upsertDocument(documentId, updatedHistory);

      return updatedHistory;
    } catch (error) {
      console.error('Error adding allergy:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to add allergy',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addMedication(usuarioId: string, medication: string): Promise<any> {
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
        medicamentos: [...(existingHistory.medicamentos || []), medication],
        updated_at: new Date().toISOString(),
      };

      await this.couchbaseService.upsertDocument(documentId, updatedHistory);

      return updatedHistory;
    } catch (error) {
      console.error('Error adding medication:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to add medication',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
