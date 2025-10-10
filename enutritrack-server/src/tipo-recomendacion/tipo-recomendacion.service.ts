import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoRecomendacion } from './models/tipo-recomendacion.model';
import { CreateTipoRecomendacionDto } from './dto/create-tipo-recomendacion.dto';
import { UpdateTipoRecomendacionDto } from './dto/update-tipo-recomendacion.dto';

@Injectable()
export class TiposRecomendacionService {
  constructor(
    @InjectRepository(TipoRecomendacion)
    private readonly tipoRecomendacionRepository: Repository<TipoRecomendacion>,
  ) {}

  async create(
    createTipoRecomendacionDto: CreateTipoRecomendacionDto,
  ): Promise<TipoRecomendacion> {
    const tipoRecomendacion = this.tipoRecomendacionRepository.create(
      createTipoRecomendacionDto,
    );
    return await this.tipoRecomendacionRepository.save(tipoRecomendacion);
  }

  async findAll(): Promise<TipoRecomendacion[]> {
    return await this.tipoRecomendacionRepository.find();
  }

  async findOne(id: string): Promise<TipoRecomendacion> {
    const tipoRecomendacion = await this.tipoRecomendacionRepository.findOne({
      where: { id },
    });
    if (!tipoRecomendacion) {
      throw new NotFoundException('Tipo de recomendación no encontrado');
    }
    return tipoRecomendacion;
  }

  async findByCategoria(categoria: string): Promise<TipoRecomendacion[]> {
    return await this.tipoRecomendacionRepository.find({
      where: { categoria },
    });
  }

  async update(
    id: string,
    updateTipoRecomendacionDto: UpdateTipoRecomendacionDto,
  ): Promise<TipoRecomendacion> {
    const tipoRecomendacion = await this.findOne(id);
    Object.assign(tipoRecomendacion, updateTipoRecomendacionDto);
    return await this.tipoRecomendacionRepository.save(tipoRecomendacion);
  }

  async remove(id: string): Promise<void> {
    const tipoRecomendacion = await this.findOne(id);
    await this.tipoRecomendacionRepository.remove(tipoRecomendacion);
  }
}
