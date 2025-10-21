import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoConsulta } from './models/tipos-consulta.model';
import { CreateTipoConsultaDto } from './dto/create-tipos-consulta.dto';
import { UpdateTipoConsultaDto } from './dto/update-tipos-consulta.dto';

@Injectable()
export class TiposConsultaService {
  constructor(
    @InjectRepository(TipoConsulta)
    private tipoConsultaRepository: Repository<TipoConsulta>,
  ) {}

  async create(createTipoConsultaDto: CreateTipoConsultaDto): Promise<TipoConsulta> {
    const tipoConsulta = this.tipoConsultaRepository.create(createTipoConsultaDto);
    return await this.tipoConsultaRepository.save(tipoConsulta);
  }

  async findAll(): Promise<TipoConsulta[]> {
    return await this.tipoConsultaRepository.find();
  }

  async findOne(id: string): Promise<TipoConsulta | null> {
    return await this.tipoConsultaRepository.findOne({ where: { id } });
  }

  async update(id: string, updateTipoConsultaDto: UpdateTipoConsultaDto): Promise<TipoConsulta | null> {
    await this.tipoConsultaRepository.update(id, updateTipoConsultaDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.tipoConsultaRepository.delete(id);
  }
}
