import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoCita } from './models/estados-cita.model';
import { CreateEstadoCitaDto } from './dto/create-estados-cita.dto';
import { UpdateEstadoCitaDto } from './dto/update-estados-cita.dto';

@Injectable()
export class EstadosCitaService {
  constructor(
    @InjectRepository(EstadoCita)
    private estadoCitaRepository: Repository<EstadoCita>,
  ) {}

  async create(createEstadoCitaDto: CreateEstadoCitaDto): Promise<EstadoCita> {
    const estadoCita = this.estadoCitaRepository.create(createEstadoCitaDto);
    return await this.estadoCitaRepository.save(estadoCita);
  }

  async findAll(): Promise<EstadoCita[]> {
    return await this.estadoCitaRepository.find();
  }

  async findOne(id: string): Promise<EstadoCita | null> {
    return await this.estadoCitaRepository.findOne({ where: { id } });
  }

  async update(id: string, updateEstadoCitaDto: UpdateEstadoCitaDto): Promise<EstadoCita | null> {
    await this.estadoCitaRepository.update(id, updateEstadoCitaDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.estadoCitaRepository.delete(id);
  }
}
