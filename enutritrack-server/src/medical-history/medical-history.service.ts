// src/medical-history/medical-history.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MedicalHistoryService {
  private readonly MEDICAL_SERVICE_URL = 'http://localhost:3000';

  constructor(private httpService: HttpService) {}

  async create(createMedicalHistoryDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.MEDICAL_SERVICE_URL}/medical-history`),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error creating medical history:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to create medical history');
    }
  }

  async findByUser(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.MEDICAL_SERVICE_URL}/medical-history/${userId}`,
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching medical history:',
        error.response?.data || error.message,
      );

      // Si es un 404, el historial médico no existe aún
      if (error.response?.status === 404) {
        return null;
      }

      throw new Error('Failed to fetch medical history');
    }
  }

  async update(
    userId: string,
    updateMedicalHistoryDto: any,
    authToken: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.MEDICAL_SERVICE_URL}/medical-history/${userId}`,
          updateMedicalHistoryDto,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error updating medical history:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to update medical history');
    }
  }
}
