import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Especialidad } from './models/especialidad.model';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';

@Injectable()
export class EspecialidadService {
  constructor(
    @InjectRepository(Especialidad)
    private especialidadRepository: Repository<Especialidad>,
  ) {}

  async create(createEspecialidadDto: CreateEspecialidadDto): Promise<Especialidad> {
    const especialidad = this.especialidadRepository.create(createEspecialidadDto);
    return await this.especialidadRepository.save(especialidad);
  }

  async findAll(): Promise<Especialidad[]> {
    return await this.especialidadRepository.find();
  }

  async findOne(id: string): Promise<Especialidad | null> {
    return await this.especialidadRepository.findOne({ where: { id } });
  }

  async update(id: string, updateEspecialidadDto: UpdateEspecialidadDto): Promise<Especialidad | null> {
    await this.especialidadRepository.update(id, updateEspecialidadDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.especialidadRepository.delete(id);
  }
}
