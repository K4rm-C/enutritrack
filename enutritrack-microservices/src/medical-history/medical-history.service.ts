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

  async findByUser(userId: string): Promise<MedicalHistory> {
    const medicalHistory = await this.medicalHistoryRepository.findOne({
      where: { usuario: { id: userId } },
      relations: ['usuario'],
    });

    if (!medicalHistory) {
      throw new NotFoundException('Historial médico no encontrado');
    }

    return medicalHistory;
  }

  async update(
    userId: string,
    updateMedicalHistoryDto: UpdateMedicalHistoryDto,
  ): Promise<MedicalHistory> {
    const medicalHistory = await this.findByUser(userId);
    Object.assign(medicalHistory, updateMedicalHistoryDto);

    return this.medicalHistoryRepository.save(medicalHistory);
  }
}
