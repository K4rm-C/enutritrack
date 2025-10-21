import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoAlerta } from './models/estados-alerta.model';
import { CreateEstadoAlertaDto } from './dto/create-estados-alerta.dto';
import { UpdateEstadoAlertaDto } from './dto/update-estados-alerta.dto';

@Injectable()
export class EstadosAlertaService {
  constructor(
    @InjectRepository(EstadoAlerta)
    private estadoAlertaRepository: Repository<EstadoAlerta>,
  ) {}

  async create(createEstadoAlertaDto: CreateEstadoAlertaDto): Promise<EstadoAlerta> {
    const estadoAlerta = this.estadoAlertaRepository.create(createEstadoAlertaDto);
    return await this.estadoAlertaRepository.save(estadoAlerta);
  }

  async findAll(): Promise<EstadoAlerta[]> {
    return await this.estadoAlertaRepository.find();
  }

  async findOne(id: string): Promise<EstadoAlerta | null> {
    return await this.estadoAlertaRepository.findOne({ where: { id } });
  }

  async update(id: string, updateEstadoAlertaDto: UpdateEstadoAlertaDto): Promise<EstadoAlerta | null> {
    await this.estadoAlertaRepository.update(id, updateEstadoAlertaDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.estadoAlertaRepository.delete(id);
  }
}
