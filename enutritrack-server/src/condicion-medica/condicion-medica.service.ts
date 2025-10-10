import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CondicionMedica } from './models/condicion-medica.model';
import { CreateCondicionMedicaDto } from './dto/create-condicion-medica.dto';
import { UpdateCondicionMedicaDto } from './dto/update-condicion-medica.dto';

@Injectable()
export class CondicionesMedicasService {
  constructor(
    @InjectRepository(CondicionMedica)
    private readonly condicionMedicaRepository: Repository<CondicionMedica>,
  ) {}

  async create(
    createCondicionMedicaDto: CreateCondicionMedicaDto,
  ): Promise<CondicionMedica> {
    const condicionMedica = this.condicionMedicaRepository.create(
      createCondicionMedicaDto,
    );
    return await this.condicionMedicaRepository.save(condicionMedica);
  }

  async findAll(): Promise<CondicionMedica[]> {
    return await this.condicionMedicaRepository.find({
      relations: ['usuario'],
    });
  }

  async findOne(id: string): Promise<CondicionMedica> {
    const condicionMedica = await this.condicionMedicaRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!condicionMedica) {
      throw new NotFoundException('Condición médica no encontrada');
    }
    return condicionMedica;
  }

  async findByUsuarioId(usuarioId: string): Promise<CondicionMedica[]> {
    return await this.condicionMedicaRepository.find({
      where: { usuario_id: usuarioId },
      relations: ['usuario'],
    });
  }

  async findActivasByUsuarioId(usuarioId: string): Promise<CondicionMedica[]> {
    return await this.condicionMedicaRepository.find({
      where: { usuario_id: usuarioId, activa: true },
      relations: ['usuario'],
    });
  }

  async update(
    id: string,
    updateCondicionMedicaDto: UpdateCondicionMedicaDto,
  ): Promise<CondicionMedica> {
    const condicionMedica = await this.findOne(id);
    Object.assign(condicionMedica, updateCondicionMedicaDto);
    return await this.condicionMedicaRepository.save(condicionMedica);
  }

  async remove(id: string): Promise<void> {
    const condicionMedica = await this.findOne(id);
    await this.condicionMedicaRepository.remove(condicionMedica);
  }

  async desactivar(id: string): Promise<CondicionMedica> {
    const condicionMedica = await this.findOne(id);
    condicionMedica.activa = false;
    return await this.condicionMedicaRepository.save(condicionMedica);
  }
}
