import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaAlerta } from './models/categorias-alerta.model';
import { CreateCategoriaAlertaDto } from './dto/create-categorias-alerta.dto';
import { UpdateCategoriaAlertaDto } from './dto/update-categorias-alerta.dto';

@Injectable()
export class CategoriasAlertaService {
  constructor(
    @InjectRepository(CategoriaAlerta)
    private categoriaAlertaRepository: Repository<CategoriaAlerta>,
  ) {}

  async create(createCategoriaAlertaDto: CreateCategoriaAlertaDto): Promise<CategoriaAlerta> {
    const categoriaAlerta = this.categoriaAlertaRepository.create(createCategoriaAlertaDto);
    return await this.categoriaAlertaRepository.save(categoriaAlerta);
  }

  async findAll(): Promise<CategoriaAlerta[]> {
    return await this.categoriaAlertaRepository.find();
  }

  async findOne(id: string): Promise<CategoriaAlerta | null> {
    return await this.categoriaAlertaRepository.findOne({ where: { id } });
  }

  async update(id: string, updateCategoriaAlertaDto: UpdateCategoriaAlertaDto): Promise<CategoriaAlerta | null> {
    await this.categoriaAlertaRepository.update(id, updateCategoriaAlertaDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.categoriaAlertaRepository.delete(id);
  }
}
