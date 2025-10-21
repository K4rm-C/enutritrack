import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genero } from './models/genero.model';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';

@Injectable()
export class GeneroService {
  constructor(
    @InjectRepository(Genero)
    private generoRepository: Repository<Genero>,
  ) {}

  async create(createGeneroDto: CreateGeneroDto): Promise<Genero> {
    const genero = this.generoRepository.create(createGeneroDto);
    return await this.generoRepository.save(genero);
  }

  async findAll(): Promise<Genero[]> {
    return await this.generoRepository.find();
  }

  async findOne(id: string): Promise<Genero | null> {
    return await this.generoRepository.findOne({ where: { id } });
  }

  async update(id: string, updateGeneroDto: UpdateGeneroDto): Promise<Genero | null> {
    await this.generoRepository.update(id, updateGeneroDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.generoRepository.delete(id);
  }
}
