import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecomendacionDato } from './models/recomendacion-dato.model';
import { CreateRecomendacionDatoDto } from './dto/create-recomendacion-dato.dto';
import { UpdateRecomendacionDatoDto } from './dto/update-recomendacion-dato.dto';

@Injectable()
export class RecomendacionDatosService {
  constructor(
    @InjectRepository(RecomendacionDato)
    private readonly recomendacionDatoRepository: Repository<RecomendacionDato>,
  ) {}

  async create(
    createRecomendacionDatoDto: CreateRecomendacionDatoDto,
  ): Promise<RecomendacionDato> {
    const recomendacionDato = this.recomendacionDatoRepository.create(
      createRecomendacionDatoDto,
    );
    return await this.recomendacionDatoRepository.save(recomendacionDato);
  }

  async createMultiple(
    datos: CreateRecomendacionDatoDto[],
  ): Promise<RecomendacionDato[]> {
    const recomendacionDatos = this.recomendacionDatoRepository.create(datos);
    return await this.recomendacionDatoRepository.save(recomendacionDatos);
  }

  async findAll(): Promise<RecomendacionDato[]> {
    return await this.recomendacionDatoRepository.find({
      relations: ['recomendacion'],
    });
  }

  async findOne(id: string): Promise<RecomendacionDato> {
    const recomendacionDato = await this.recomendacionDatoRepository.findOne({
      where: { id },
      relations: ['recomendacion'],
    });
    if (!recomendacionDato) {
      throw new NotFoundException('Dato de recomendación no encontrado');
    }
    return recomendacionDato;
  }

  async findByRecomendacionId(
    recomendacionId: string,
  ): Promise<RecomendacionDato[]> {
    return await this.recomendacionDatoRepository.find({
      where: { recomendacion_id: recomendacionId },
      relations: ['recomendacion'],
    });
  }

  async findByClave(clave: string): Promise<RecomendacionDato[]> {
    return await this.recomendacionDatoRepository.find({
      where: { clave },
      relations: ['recomendacion'],
    });
  }

  async update(
    id: string,
    updateRecomendacionDatoDto: UpdateRecomendacionDatoDto,
  ): Promise<RecomendacionDato> {
    const recomendacionDato = await this.findOne(id);
    Object.assign(recomendacionDato, updateRecomendacionDatoDto);
    return await this.recomendacionDatoRepository.save(recomendacionDato);
  }

  async remove(id: string): Promise<void> {
    const recomendacionDato = await this.findOne(id);
    await this.recomendacionDatoRepository.remove(recomendacionDato);
  }

  async removeByRecomendacionId(recomendacionId: string): Promise<void> {
    const datos = await this.findByRecomendacionId(recomendacionId);
    await this.recomendacionDatoRepository.remove(datos);
  }
}
