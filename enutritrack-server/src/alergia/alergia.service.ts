import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alergia } from './models/alergia.model';
import { CreateAlergiaDto } from './dto/create-alergia.dto';
import { UpdateAlergiaDto } from './dto/update-alergia.dto';

@Injectable()
export class AlergiasService {
  constructor(
    @InjectRepository(Alergia)
    private readonly alergiaRepository: Repository<Alergia>,
  ) {}

  async create(createAlergiaDto: CreateAlergiaDto): Promise<Alergia> {
    const alergia = this.alergiaRepository.create(createAlergiaDto);
    return await this.alergiaRepository.save(alergia);
  }

  async findAll(): Promise<Alergia[]> {
    return await this.alergiaRepository.find({
      relations: ['usuario'],
    });
  }

  async findOne(id: string): Promise<Alergia> {
    const alergia = await this.alergiaRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!alergia) {
      throw new NotFoundException('Alergia no encontrada');
    }
    return alergia;
  }

  async findByUsuarioId(usuarioId: string): Promise<Alergia[]> {
    return await this.alergiaRepository.find({
      where: { usuario_id: usuarioId },
      relations: ['usuario'],
    });
  }

  async findActivasByUsuarioId(usuarioId: string): Promise<Alergia[]> {
    return await this.alergiaRepository.find({
      where: { usuario_id: usuarioId, activa: true },
      relations: ['usuario'],
    });
  }

  async findByTipo(tipo: string): Promise<Alergia[]> {
    return await this.alergiaRepository.find({
      where: { tipo },
      relations: ['usuario'],
    });
  }

  async update(
    id: string,
    updateAlergiaDto: UpdateAlergiaDto,
  ): Promise<Alergia> {
    const alergia = await this.findOne(id);
    Object.assign(alergia, updateAlergiaDto);
    return await this.alergiaRepository.save(alergia);
  }

  async remove(id: string): Promise<void> {
    const alergia = await this.findOne(id);
    await this.alergiaRepository.remove(alergia);
  }

  async desactivar(id: string): Promise<Alergia> {
    const alergia = await this.findOne(id);
    alergia.activa = false;
    return await this.alergiaRepository.save(alergia);
  }
}
