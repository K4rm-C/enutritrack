import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoAlerta } from './models/tipos-alerta.model';
import { CreateTipoAlertaDto } from './dto/create-tipos-alerta.dto';
import { UpdateTipoAlertaDto } from './dto/update-tipos-alerta.dto';

@Injectable()
export class TiposAlertaService {
  constructor(
    @InjectRepository(TipoAlerta)
    private tipoAlertaRepository: Repository<TipoAlerta>,
  ) {}

  async create(createTipoAlertaDto: CreateTipoAlertaDto): Promise<TipoAlerta> {
    const tipoAlerta = this.tipoAlertaRepository.create(createTipoAlertaDto);
    return await this.tipoAlertaRepository.save(tipoAlerta);
  }

  async findAll(): Promise<TipoAlerta[]> {
    return await this.tipoAlertaRepository.find({
      relations: ['categoria']
    });
  }

  async findOne(id: string): Promise<TipoAlerta | null> {
    return await this.tipoAlertaRepository.findOne({ 
      where: { id },
      relations: ['categoria']
    });
  }

  async update(id: string, updateTipoAlertaDto: UpdateTipoAlertaDto): Promise<TipoAlerta | null> {
    await this.tipoAlertaRepository.update(id, updateTipoAlertaDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.tipoAlertaRepository.delete(id);
  }
}
