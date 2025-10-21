import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NivelPrioridadAlerta } from './models/niveles-prioridad-alerta.model';
import { CreateNivelPrioridadAlertaDto } from './dto/create-niveles-prioridad-alerta.dto';
import { UpdateNivelPrioridadAlertaDto } from './dto/update-niveles-prioridad-alerta.dto';

@Injectable()
export class NivelesPrioridadAlertaService {
  constructor(
    @InjectRepository(NivelPrioridadAlerta)
    private nivelPrioridadAlertaRepository: Repository<NivelPrioridadAlerta>,
  ) {}

  async create(createNivelPrioridadAlertaDto: CreateNivelPrioridadAlertaDto): Promise<NivelPrioridadAlerta> {
    const nivelPrioridadAlerta = this.nivelPrioridadAlertaRepository.create(createNivelPrioridadAlertaDto);
    return await this.nivelPrioridadAlertaRepository.save(nivelPrioridadAlerta);
  }

  async findAll(): Promise<NivelPrioridadAlerta[]> {
    return await this.nivelPrioridadAlertaRepository.find();
  }

  async findOne(id: string): Promise<NivelPrioridadAlerta | null> {
    return await this.nivelPrioridadAlertaRepository.findOne({ where: { id } });
  }

  async update(id: string, updateNivelPrioridadAlertaDto: UpdateNivelPrioridadAlertaDto): Promise<NivelPrioridadAlerta | null> {
    await this.nivelPrioridadAlertaRepository.update(id, updateNivelPrioridadAlertaDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.nivelPrioridadAlertaRepository.delete(id);
  }
}
