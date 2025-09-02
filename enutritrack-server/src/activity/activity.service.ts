// src/physical-activity/physical-activity.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PhysicalActivityService {
  private readonly ACTIVITY_SERVICE_URL = 'http://localhost:5000';

  constructor(private httpService: HttpService) {}

  async create(createPhysicalActivityDto: any, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.ACTIVITY_SERVICE_URL}/physical-activity`,
          createPhysicalActivityDto,
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
        'Error creating physical activity:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to create physical activity');
    }
  }

  async findAllByUser(userId: string, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.ACTIVITY_SERVICE_URL}/physical-activity/user/${userId}`,
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
        'Error fetching physical activities:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to fetch physical activities');
    }
  }

  async findOne(id: string, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.ACTIVITY_SERVICE_URL}/physical-activity/${id}`,
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
        'Error fetching physical activity:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to fetch physical activity');
    }
  }

  async update(id: string, updatePhysicalActivityDto: any, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.ACTIVITY_SERVICE_URL}/physical-activity/${id}`,
          updatePhysicalActivityDto,
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
        'Error updating physical activity:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to update physical activity');
    }
  }

  async remove(id: string, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.ACTIVITY_SERVICE_URL}/physical-activity/${id}`,
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
        'Error deleting physical activity:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to delete physical activity');
    }
  }

  async getWeeklySummary(userId: string, startDate: Date, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.ACTIVITY_SERVICE_URL}/physical-activity/weekly-summary/${userId}`,
          {
            params: { startDate: startDate.toISOString() },
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching weekly summary:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to fetch weekly summary');
    }
  }
}
