import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreatePhysicalActivityDto } from './dto/create-physical-activity.dto';
import { PhysicalActivity } from './models/activity.model';

@Injectable()
export class PhysicalActivityService {
  constructor(
    @InjectRepository(PhysicalActivity)
    private readonly activityRepository: Repository<PhysicalActivity>,
  ) {}

  async create(
    createPhysicalActivityDto: CreatePhysicalActivityDto,
  ): Promise<PhysicalActivity> {
    try {
      const activity = this.activityRepository.create({
        ...createPhysicalActivityDto,
        fecha: createPhysicalActivityDto.fecha || new Date(),
      });

      const savedActivity = await this.activityRepository.save(activity);
      return savedActivity;
    } catch (error) {
      console.error('Error creating physical activity:', error);
      throw new HttpException(
        'Failed to create physical activity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllByUser(usuarioId: string): Promise<PhysicalActivity[]> {
    try {
      const activities = await this.activityRepository.find({
        where: { usuario: { id: usuarioId } },
        order: { created_at: 'DESC' },
      });

      return activities;
    } catch (error) {
      console.error('Error fetching physical activities:', error);
      throw new HttpException(
        'Failed to fetch physical activities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<PhysicalActivity> {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id },
      });

      if (!activity) {
        throw new HttpException(
          'Physical activity not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return activity;
    } catch (error) {
      console.error('Error fetching physical activity:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to fetch physical activity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    updatePhysicalActivityDto: Partial<CreatePhysicalActivityDto>,
  ): Promise<PhysicalActivity> {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id },
        relations: ['usuario'],
      });

      if (!activity) {
        throw new HttpException(
          'Physical activity not found',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.activityRepository.update(id, updatePhysicalActivityDto);
      const updatedActivity = await this.activityRepository.findOne({
        where: { id },
        relations: ['usuario'],
      });

      if (!updatedActivity) {
        throw new HttpException(
          'Updated activity not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return updatedActivity;
    } catch (error) {
      console.error('Error updating physical activity:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to update physical activity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id },
      });

      if (!activity) {
        throw new HttpException(
          'Physical activity not found',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.activityRepository.delete(id);
    } catch (error) {
      console.error('Error deleting physical activity:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to delete physical activity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getWeeklySummary(usuarioId: string, startDate: Date): Promise<any> {
    try {
      // Calcular rango de la semana
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);

      const activities = await this.activityRepository.find({
        where: {
          usuario: { id: usuarioId },
          fecha: Between(startDate, endDate),
        },
        order: { fecha: 'ASC' },
      });

      // Calcular totales semanales
      const totalDuracion = activities.reduce(
        (sum, activity) => sum + (activity.duracion || 0),
        0,
      );
      const totalCaloriasQuemadas = activities.reduce(
        (sum, activity) => sum + (activity.caloriasQuemadas || 0),
        0,
      );
      const tiposActividad = [
        ...new Set(activities.map((activity) => activity.tipo_actividad)),
      ];

      const summary = {
        totalDuracion,
        totalCaloriasQuemadas,
        numeroActividades: activities.length,
        tiposActividad,
        fechaInicio: startDate.toISOString(),
        fechaFin: endDate.toISOString(),
        actividades: activities,
      };

      return summary;
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
      throw new HttpException(
        'Failed to fetch weekly summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
