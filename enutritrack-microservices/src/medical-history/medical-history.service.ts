// src/medical-history/medical-history.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalHistory } from './model/medical-history.model';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';
import { UpdateMedicalHistoryDto } from './dto/update-medical-history.dto';
import { User } from '../users/models/user.model';
import { CondicionMedica } from './model/condicion-medica.model';
import { Alergia } from './model/alergia.model';
import { Medicamento } from './model/medicamento.model';

@Injectable()
export class MedicalHistoryService {
  constructor(
    @InjectRepository(MedicalHistory)
    private medicalHistoryRepository: Repository<MedicalHistory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CondicionMedica)
    private condicionMedicaRepository: Repository<CondicionMedica>,
    @InjectRepository(Alergia)
    private alergiaRepository: Repository<Alergia>,
    @InjectRepository(Medicamento)
    private medicamentoRepository: Repository<Medicamento>,
  ) {}

  async create(
    createMedicalHistoryDto: CreateMedicalHistoryDto,
    doctorId: string,
  ): Promise<any> {
    console.log(
      'Doctor:',
      doctorId,
      'creando historial para paciente:',
      createMedicalHistoryDto.pacienteId,
    );

    // Verificar que el paciente existe
    const paciente = await this.userRepository.findOne({
      where: { id: createMedicalHistoryDto.pacienteId },
    });

    if (!paciente) {
      console.error(
        'Paciente no encontrado con ID:',
        createMedicalHistoryDto.pacienteId,
      );
      throw new NotFoundException(
        `Paciente con ID ${createMedicalHistoryDto.pacienteId} no encontrado`,
      );
    }

    try {
      // Crear historial médico principal
      const medicalHistory = this.medicalHistoryRepository.create({
        usuarioId: createMedicalHistoryDto.pacienteId, // Usar ID del paciente
      });

      const savedMedicalHistory =
        await this.medicalHistoryRepository.save(medicalHistory);
      console.log('Historial médico creado:', savedMedicalHistory);

      // Crear condiciones médicas si existen
      if (
        createMedicalHistoryDto.condiciones &&
        createMedicalHistoryDto.condiciones.length > 0
      ) {
        const condiciones = createMedicalHistoryDto.condiciones.map(
          (condicion) =>
            this.condicionMedicaRepository.create({
              ...condicion,
              usuarioId: createMedicalHistoryDto.pacienteId, // Usar ID del paciente
            }),
        );
        await this.condicionMedicaRepository.save(condiciones);
        console.log('Condiciones médicas creadas:', condiciones.length);
      }

      // Crear alergias si existen
      if (
        createMedicalHistoryDto.alergias &&
        createMedicalHistoryDto.alergias.length > 0
      ) {
        const alergias = createMedicalHistoryDto.alergias.map((alergia) =>
          this.alergiaRepository.create({
            ...alergia,
            usuarioId: createMedicalHistoryDto.pacienteId, // Usar ID del paciente
          }),
        );
        await this.alergiaRepository.save(alergias);
        console.log('Alergias creadas:', alergias.length);
      }

      // Crear medicamentos si existen
      if (
        createMedicalHistoryDto.medicamentos &&
        createMedicalHistoryDto.medicamentos.length > 0
      ) {
        const medicamentos = createMedicalHistoryDto.medicamentos.map(
          (medicamento) =>
            this.medicamentoRepository.create({
              ...medicamento,
              usuarioId: createMedicalHistoryDto.pacienteId, // Usar ID del paciente
            }),
        );
        await this.medicamentoRepository.save(medicamentos);
        console.log('Medicamentos creados:', medicamentos.length);
      }

      return this.getCompleteMedicalHistory(createMedicalHistoryDto.pacienteId);
    } catch (error) {
      console.error('Error completo al crear historial médico:', error);
      throw error;
    }
  }

  async findByUser(userId: string): Promise<any> {
    console.log('Buscando historial médico para usuario:', userId);
    return this.getCompleteMedicalHistory(userId);
  }

  async update(
    userId: string,
    updateMedicalHistoryDto: UpdateMedicalHistoryDto,
  ): Promise<any> {
    console.log(
      'Actualizando historial médico para usuario:',
      userId,
      'con datos:',
      updateMedicalHistoryDto,
    );

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Actualizar condiciones médicas si se proporcionan
    if (updateMedicalHistoryDto.condiciones) {
      await this.condicionMedicaRepository.delete({ usuarioId: userId });

      if (updateMedicalHistoryDto.condiciones.length > 0) {
        const nuevasCondiciones = updateMedicalHistoryDto.condiciones.map(
          (condicion) =>
            this.condicionMedicaRepository.create({
              ...condicion,
              usuarioId: userId,
            }),
        );
        await this.condicionMedicaRepository.save(nuevasCondiciones);
      }
    }

    // Actualizar alergias si se proporcionan
    if (updateMedicalHistoryDto.alergias) {
      await this.alergiaRepository.delete({ usuarioId: userId });

      if (updateMedicalHistoryDto.alergias.length > 0) {
        const nuevasAlergias = updateMedicalHistoryDto.alergias.map((alergia) =>
          this.alergiaRepository.create({
            ...alergia,
            usuarioId: userId,
          }),
        );
        await this.alergiaRepository.save(nuevasAlergias);
      }
    }

    // Actualizar medicamentos si se proporcionan
    if (updateMedicalHistoryDto.medicamentos) {
      await this.medicamentoRepository.delete({ usuarioId: userId });

      if (updateMedicalHistoryDto.medicamentos.length > 0) {
        const nuevosMedicamentos = updateMedicalHistoryDto.medicamentos.map(
          (medicamento) =>
            this.medicamentoRepository.create({
              ...medicamento,
              usuarioId: userId,
            }),
        );
        await this.medicamentoRepository.save(nuevosMedicamentos);
      }
    }

    return this.getCompleteMedicalHistory(userId);
  }

  private async getCompleteMedicalHistory(userId: string): Promise<any> {
    const [medicalHistories, condiciones, alergias, medicamentos] =
      await Promise.all([
        this.medicalHistoryRepository.find({
          where: { usuarioId: userId },
          order: { created_at: 'DESC' },
        }),
        this.condicionMedicaRepository.find({
          where: { usuarioId: userId },
        }),
        this.alergiaRepository.find({
          where: { usuarioId: userId },
        }),
        this.medicamentoRepository.find({
          where: { usuarioId: userId },
        }),
      ]);

    return {
      medicalHistories,
      condiciones,
      alergias,
      medicamentos,
    };
  }

  async healthCheck() {
    const startTime = Date.now();

    const uptime = Math.floor((Date.now() - startTime) / 1000);

    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      service: process.env.SERVICE_NAME || 'Microservicio de historial médico',
      version: process.env.APP_VERSION || '1.1.0',
    };
  }
}
