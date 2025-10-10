import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alimento } from './models/alimento.model';
import { CreateAlimentoDto } from './dto/create-alimento.dtio';
import { UpdateAlimentoDto } from './dto/update-alimento.dto';

@Injectable()
export class AlimentosService {
  constructor(
    @InjectRepository(Alimento)
    private readonly alimentoRepository: Repository<Alimento>,
  ) {}

  async create(createAlimentoDto: CreateAlimentoDto): Promise<Alimento> {
    const alimento = this.alimentoRepository.create(createAlimentoDto);
    return await this.alimentoRepository.save(alimento);
  }

  async findAll(): Promise<Alimento[]> {
    return await this.alimentoRepository.find();
  }

  async findOne(id: string): Promise<Alimento> {
    const alimento = await this.alimentoRepository.findOne({ where: { id } });
    if (!alimento) {
      throw new NotFoundException('Alimento no encontrado');
    }
    return alimento;
  }

  async findByCategoria(categoria: string): Promise<Alimento[]> {
    return await this.alimentoRepository.find({ where: { categoria } });
  }

  async searchByName(nombre: string): Promise<Alimento[]> {
    return await this.alimentoRepository
      .createQueryBuilder('alimento')
      .where('alimento.nombre ILIKE :nombre', { nombre: `%${nombre}%` })
      .getMany();
  }

  async update(
    id: string,
    updateAlimentoDto: UpdateAlimentoDto,
  ): Promise<Alimento> {
    const alimento = await this.findOne(id);
    Object.assign(alimento, updateAlimentoDto);
    return await this.alimentoRepository.save(alimento);
  }

  async remove(id: string): Promise<void> {
    const alimento = await this.findOne(id);
    await this.alimentoRepository.remove(alimento);
  }
}
