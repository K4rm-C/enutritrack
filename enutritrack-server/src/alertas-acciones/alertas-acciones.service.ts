import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertaAccion } from './models/alertas-acciones.model';
import { CreateAlertaAccionDto } from './dto/create-alertas-acciones.dto';
import { UpdateAlertaAccionDto } from './dto/update-alertas-acciones.dto';

@Injectable()
export class AlertasAccionesService {
  constructor(
    @InjectRepository(AlertaAccion)
    private alertaAccionRepository: Repository<AlertaAccion>,
  ) {}

  async create(createAlertaAccionDto: CreateAlertaAccionDto): Promise<AlertaAccion> {
    const alertaAccion = this.alertaAccionRepository.create(createAlertaAccionDto);
    return await this.alertaAccionRepository.save(alertaAccion);
  }

  async findByAlerta(alertaId: string): Promise<AlertaAccion[]> {
    return await this.alertaAccionRepository.find({
      where: { alerta_id: alertaId },
      relations: ['doctor', 'alerta'],
      order: { fecha_accion: 'DESC' }
    });
  }

  async findByDoctor(doctorId: string): Promise<AlertaAccion[]> {
    return await this.alertaAccionRepository.find({
      where: { doctor_id: doctorId },
      relations: ['doctor', 'alerta'],
      order: { fecha_accion: 'DESC' }
    });
  }

  async findOne(id: string): Promise<AlertaAccion | null> {
    return await this.alertaAccionRepository.findOne({ 
      where: { id },
      relations: ['doctor', 'alerta']
    });
  }

  async update(id: string, updateAlertaAccionDto: UpdateAlertaAccionDto): Promise<AlertaAccion | null> {
    const result = await this.alertaAccionRepository.update(id, updateAlertaAccionDto);
    if (result.affected === 0) {
      throw new NotFoundException('Acción de alerta no encontrada');
    }
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.alertaAccionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Acción de alerta no encontrada');
    }
  }
}
