// src/physical-activity/physical-activity.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PhysicalActivity } from './models/activity.model';
import { CreatePhysicalActivityDto } from './dto/create-physical-activity.dto';
import { UpdatePhysicalActivityDto } from './dto/update-physical-activity.dto';
import { User } from '../users/models/user.model';

@Injectable()
export class PhysicalActivityService {
  constructor(
    @InjectRepository(PhysicalActivity)
    private physicalActivityRepository: Repository<PhysicalActivity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createPhysicalActivityDto: CreatePhysicalActivityDto,
  ): Promise<PhysicalActivity> {
    const user = await this.userRepository.findOne({
      where: { id: createPhysicalActivityDto.usuarioId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const physicalActivity = this.physicalActivityRepository.create({
      ...createPhysicalActivityDto,
      usuario: user,
    });

    return this.physicalActivityRepository.save(physicalActivity);
  }

  async findAllByUser(userId: string): Promise<PhysicalActivity[]> {
    return this.physicalActivityRepository.find({
      where: { usuario: { id: userId } },
      relations: ['usuario'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PhysicalActivity> {
    const physicalActivity = await this.physicalActivityRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!physicalActivity) {
      throw new NotFoundException('Actividad física no encontrada');
    }

    return physicalActivity;
  }

  async update(
    id: string,
    updatePhysicalActivityDto: UpdatePhysicalActivityDto,
  ): Promise<PhysicalActivity> {
    const physicalActivity = await this.findOne(id);

    if (updatePhysicalActivityDto.usuarioId) {
      const user = await this.userRepository.findOne({
        where: { id: updatePhysicalActivityDto.usuarioId },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      physicalActivity.usuario = user;
    }

    Object.assign(physicalActivity, updatePhysicalActivityDto);

    return this.physicalActivityRepository.save(physicalActivity);
  }

  async remove(id: string): Promise<void> {
    const physicalActivity = await this.findOne(id);
    await this.physicalActivityRepository.remove(physicalActivity);
  }

  async getWeeklySummary(userId: string, startDate: Date): Promise<any> {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);

    const activities = await this.physicalActivityRepository.find({
      where: {
        usuario: { id: userId },
        fecha: Between(startDate, endDate),
      },
    });

    const summary = activities.reduce(
      (acc, activity) => {
        acc.totalMinutos += activity.duracion;
        acc.totalCaloriasQuemadas += activity.caloriasQuemadas;
        acc.actividadesPorTipo[activity.tipo_actividad] =
          (acc.actividadesPorTipo[activity.tipo_actividad] || 0) +
          activity.duracion;
        return acc;
      },
      {
        totalMinutos: 0,
        totalCaloriasQuemadas: 0,
        actividadesPorTipo: {},
      },
    );

    return summary;
  }
}
