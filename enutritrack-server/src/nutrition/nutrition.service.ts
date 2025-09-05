// src/nutrition/nutrition.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NutritionService {
  private readonly NUTRITION_SERVICE_URL = 'http://localhost:3003';

  constructor(private httpService: HttpService) {}

  private prepareNutritionData(data: any): any {
    const preparedData = {
      usuarioId: data.usuarioId,
      tipo_comida: data.tipo_comida || 'almuerzo',
      descripcion: data.descripcion || data.comida || '',
      calorias: data.calorias,
      proteinas: data.proteinas,
      carbohidratos: data.carbohidratos,
      grasas: data.grasas,
    };

    return preparedData;
  }

  async create(createFoodRecordDto: any, authToken: string) {
    try {
      const preparedData = this.prepareNutritionData(createFoodRecordDto);

      console.log('Enviando datos al microservicio:', preparedData);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.NUTRITION_SERVICE_URL}/nutrition`,
          preparedData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error creating food record:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to create food record');
    }
  }

  async update(id: string, updateFoodRecordDto: any, authToken: string) {
    try {
      const preparedData = this.prepareNutritionData(updateFoodRecordDto);

      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.NUTRITION_SERVICE_URL}/nutrition/${id}`,
          preparedData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            // También eliminamos transformRequest aquí
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error updating food record:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to update food record');
    }
  }

  async findAllByUser(userId: string, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.NUTRITION_SERVICE_URL}/nutrition/user/${userId}`,
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
        'Error fetching food records:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to fetch food records');
    }
  }

  async findOne(id: string, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.NUTRITION_SERVICE_URL}/nutrition/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching food record:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to fetch food record');
    }
  }

  async remove(id: string, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.NUTRITION_SERVICE_URL}/nutrition/${id}`,
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
        'Error deleting food record:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to delete food record');
    }
  }

  async getDailySummary(userId: string, date: Date, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.NUTRITION_SERVICE_URL}/nutrition/daily-summary/${userId}`,
          {
            params: { date: date.toISOString() },
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching daily summary:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to fetch daily summary');
    }
  }
}
