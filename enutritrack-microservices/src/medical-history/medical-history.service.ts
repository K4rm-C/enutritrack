// src/medical-history/medical-history.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalHistory } from './model/medical-history.model';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';
import { UpdateMedicalHistoryDto } from './dto/update-medical-history.dto';
import { User } from '../users/models/user.model';

@Injectable()
export class MedicalHistoryService {
  constructor(
    @InjectRepository(MedicalHistory)
    private medicalHistoryRepository: Repository<MedicalHistory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createMedicalHistoryDto: CreateMedicalHistoryDto,
  ): Promise<MedicalHistory> {
    const user = await this.userRepository.findOne({
      where: { id: createMedicalHistoryDto.usuarioId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const medicalHistory = this.medicalHistoryRepository.create({
      ...createMedicalHistoryDto,
      usuario: user,
    });

    return this.medicalHistoryRepository.save(medicalHistory);
  }

  async findByUser(userId: string): Promise<MedicalHistory[]> {
    console.log(`Buscando historiales médicos para usuario: ${userId}`);

    try {
      const medicalHistories = await this.medicalHistoryRepository.find({
        where: { usuario: { id: userId } },
        relations: ['usuario'],
        order: { created_at: 'DESC' }, // Ordenar por fecha más reciente
      });

      console.log('Historiales encontrados:', medicalHistories.length);

      if (!medicalHistories || medicalHistories.length === 0) {
        console.log(
          'No se encontraron historiales médicos para usuario:',
          userId,
        );
        return [];
      }

      return medicalHistories;
    } catch (error) {
      console.error('Error en servicio findByUser:', error);
      throw error;
    }
  }

  async update(
    userId: string,
    updateMedicalHistoryDto: UpdateMedicalHistoryDto,
  ): Promise<MedicalHistory> {
    const medicalHistories = await this.findByUser(userId);
    if (!medicalHistories.length) {
      throw new NotFoundException('Medical history not found');
    }
    const medicalHistory = medicalHistories[0]; // Get the most recent one
    Object.assign(medicalHistory, updateMedicalHistoryDto);

    return this.medicalHistoryRepository.save(medicalHistory);
  }
}
