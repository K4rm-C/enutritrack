import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoActividad } from './models/tipo-actividad.model';
import { CreateTipoActividadDto } from './dto/create-tipo-actividad.dto';
import { UpdateTipoActividadDto } from './dto/update-tipo-actividad.dto';

@Injectable()
export class TiposActividadService {
  constructor(
    @InjectRepository(TipoActividad)
    private readonly tipoActividadRepository: Repository<TipoActividad>,
  ) {}

  async create(
    createTipoActividadDto: CreateTipoActividadDto,
  ): Promise<TipoActividad> {
    const tipoActividad = this.tipoActividadRepository.create(
      createTipoActividadDto,
    );
    return await this.tipoActividadRepository.save(tipoActividad);
  }

  async findAll(): Promise<TipoActividad[]> {
    return await this.tipoActividadRepository.find();
  }

  async findOne(id: string): Promise<TipoActividad> {
    const tipoActividad = await this.tipoActividadRepository.findOne({
      where: { id },
    });
    if (!tipoActividad) {
      throw new NotFoundException('Tipo de actividad no encontrado');
    }
    return tipoActividad;
  }

  async findByCategoria(categoria: string): Promise<TipoActividad[]> {
    return await this.tipoActividadRepository.find({ where: { categoria } });
  }

  async update(
    id: string,
    updateTipoActividadDto: UpdateTipoActividadDto,
  ): Promise<TipoActividad> {
    const tipoActividad = await this.findOne(id);
    Object.assign(tipoActividad, updateTipoActividadDto);
    return await this.tipoActividadRepository.save(tipoActividad);
  }

  async remove(id: string): Promise<void> {
    const tipoActividad = await this.findOne(id);
    await this.tipoActividadRepository.remove(tipoActividad);
  }
}
