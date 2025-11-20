import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PhysicalActivity } from './models/activity.model';
import { ActivityType } from './models/tipos_actividad.model';
import {
  CreatePhysicalActivityDto,
  UpdatePhysicalActivityDto,
} from './dto/create-physical-activity.dto';

@Injectable()
export class PhysicalActivityService {
  constructor(
    @InjectRepository(PhysicalActivity)
    private activityRepository: Repository<PhysicalActivity>,
    @InjectRepository(ActivityType)
    private activityTypeRepository: Repository<ActivityType>,
  ) {}

  async create(
    createDto: CreatePhysicalActivityDto,
  ): Promise<PhysicalActivity> {
    try {
      const activityType = await this.activityTypeRepository.findOne({
        where: { id: createDto.tipo_actividad_id },
      });

      if (!activityType) {
        throw new NotFoundException('Tipo de actividad no encontrado');
      }

      let calorias_quemadas = createDto.calorias_quemadas;
      if (!calorias_quemadas) {
        calorias_quemadas = this.calculateCalories(
          activityType.met_value,
          createDto.duracion_min,
          70,
        );
      }

      const activity = this.activityRepository.create({
        ...createDto,
        calorias_quemadas,
      });

      return await this.activityRepository.save(activity);
    } catch (error) {
      throw new BadRequestException(
        `Error al crear actividad: ${error.message}`,
      );
    }
  }

  private calculateCalories(
    metValue: number,
    durationMin: number,
    weightKg: number,
  ): number {
    const calories = metValue * weightKg * (durationMin / 60);
    return Math.round(calories * 100) / 100;
  }

  async findAllByUser(userId: string): Promise<PhysicalActivity[]> {
    return this.activityRepository.find({
      where: { usuario_id: userId },
      relations: ['tipo_actividad'],
      order: { fecha: 'DESC' },
    });
  }

  async findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<PhysicalActivity[]> {
    return this.activityRepository.find({
      where: {
        usuario_id: userId,
        fecha: Between(startDate, endDate),
      },
      relations: ['tipo_actividad'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PhysicalActivity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['tipo_actividad'],
    });

    if (!activity) {
      throw new NotFoundException('Actividad física no encontrada');
    }

    return activity;
  }

  async update(
    id: string,
    updateDto: UpdatePhysicalActivityDto,
  ): Promise<PhysicalActivity> {
    const activity = await this.findOne(id);

    if (updateDto.tipo_actividad_id) {
      const activityType = await this.activityTypeRepository.findOne({
        where: { id: updateDto.tipo_actividad_id },
      });

      if (!activityType) {
        throw new NotFoundException('Tipo de actividad no encontrado');
      }
      activity.tipo_actividad_id = updateDto.tipo_actividad_id;
    }

    Object.assign(activity, updateDto);
    return this.activityRepository.save(activity);
  }

  async delete(id: string): Promise<void> {
    const result = await this.activityRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Actividad física no encontrada');
    }
  }

  async getActivityTypes(): Promise<ActivityType[]> {
    return this.activityTypeRepository.find({ order: { nombre: 'ASC' } });
  }

  async getWeeklySummary(userId: string, startDate: Date): Promise<any> {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);

    const activities = await this.findByUserAndDateRange(
      userId,
      startDate,
      endDate,
    );

    const summary = activities.reduce(
      (acc, activity) => {
        acc.totalMinutos += activity.duracion_min;
        acc.totalCalorias += Number(activity.calorias_quemadas);
        acc.totalActividades += 1;

        if (!acc.actividadesPorTipo[activity.tipo_actividad.nombre]) {
          acc.actividadesPorTipo[activity.tipo_actividad.nombre] = {
            minutos: 0,
            calorias: 0,
            count: 0,
          };
        }

        acc.actividadesPorTipo[activity.tipo_actividad.nombre].minutos +=
          activity.duracion_min;
        acc.actividadesPorTipo[activity.tipo_actividad.nombre].calorias +=
          Number(activity.calorias_quemadas);
        acc.actividadesPorTipo[activity.tipo_actividad.nombre].count += 1;

        return acc;
      },
      {
        totalMinutos: 0,
        totalCalorias: 0,
        totalActividades: 0,
        actividadesPorTipo: {},
      },
    );

    return summary;
  }

  async getMonthlyStats(
    userId: string,
    year: number,
    month: number,
  ): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const activities = await this.findByUserAndDateRange(
      userId,
      startDate,
      endDate,
    );

    const stats = {
      totalMinutos: 0,
      totalCalorias: 0,
      actividadesPorDia: {},
      tipoMasFrecuente: '',
      diasActivos: 0,
    };

    const diasUnicos = new Set();

    activities.forEach((activity) => {
      stats.totalMinutos += activity.duracion_min;
      stats.totalCalorias += Number(activity.calorias_quemadas);

      const fecha = activity.fecha.toISOString().split('T')[0];
      diasUnicos.add(fecha);

      if (!stats.actividadesPorDia[fecha]) {
        stats.actividadesPorDia[fecha] = {
          minutos: 0,
          calorias: 0,
          actividades: 0,
        };
      }

      stats.actividadesPorDia[fecha].minutos += activity.duracion_min;
      stats.actividadesPorDia[fecha].calorias += Number(
        activity.calorias_quemadas,
      );
      stats.actividadesPorDia[fecha].actividades += 1;
    });

    stats.diasActivos = diasUnicos.size;

    const tipoCount = activities.reduce((acc, activity) => {
      acc[activity.tipo_actividad.nombre] =
        (acc[activity.tipo_actividad.nombre] || 0) + 1;
      return acc;
    }, {});

    stats.tipoMasFrecuente = Object.keys(tipoCount).reduce(
      (a, b) => (tipoCount[a] > tipoCount[b] ? a : b),
      '',
    );

    return stats;
  }

  async healthCheck() {
    const startTime = Date.now();

    const uptime = Math.floor((Date.now() - startTime) / 1000);

    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      service: process.env.SERVICE_NAME || 'Microservicio de actividad física',
      version: process.env.APP_VERSION || '1.1.0',
    };
  }
}
