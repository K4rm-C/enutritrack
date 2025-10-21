import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjetivoUsuario } from './models/objetivo-usuario.model';

@Injectable()
export class ObjetivoUsuarioService {
  constructor(
    @InjectRepository(ObjetivoUsuario)
    private readonly objetivoUsuarioRepository: Repository<ObjetivoUsuario>,
  ) {}

  async findByUsuarioId(usuarioId: string): Promise<ObjetivoUsuario | null> {
    return await this.objetivoUsuarioRepository.findOne({
      where: { usuario_id: usuarioId, vigente: true },
      order: { fecha_establecido: 'DESC' },
    });
  }

  async findAllByUsuarioId(usuarioId: string): Promise<ObjetivoUsuario[]> {
    return await this.objetivoUsuarioRepository.find({
      where: { usuario_id: usuarioId },
      order: { fecha_establecido: 'DESC' },
    });
  }

  async create(objetivoData: Partial<ObjetivoUsuario>): Promise<ObjetivoUsuario> {
    const objetivo = this.objetivoUsuarioRepository.create(objetivoData);
    return await this.objetivoUsuarioRepository.save(objetivo);
  }

  async update(id: string, objetivoData: Partial<ObjetivoUsuario>): Promise<ObjetivoUsuario | null> {
    await this.objetivoUsuarioRepository.update(id, objetivoData);
    return await this.objetivoUsuarioRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<ObjetivoUsuario[]> {
    return await this.objetivoUsuarioRepository.find({
      order: { fecha_establecido: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ObjetivoUsuario | null> {
    const objetivo = await this.objetivoUsuarioRepository.findOne({ where: { id } });
    if (!objetivo) {
      throw new NotFoundException('Objetivo de usuario no encontrado');
    }
    return objetivo;
  }

  async findVigenteByUsuarioId(usuarioId: string): Promise<ObjetivoUsuario | null> {
    return await this.objetivoUsuarioRepository.findOne({
      where: { usuario_id: usuarioId, vigente: true },
      order: { fecha_establecido: 'DESC' },
    });
  }

  async desactivarObjetivosAnteriores(usuarioId: string): Promise<void> {
    await this.objetivoUsuarioRepository.update(
      { usuario_id: usuarioId, vigente: true },
      { vigente: false }
    );
  }

  async remove(id: string): Promise<void> {
    const objetivo = await this.findOne(id);
    if (objetivo) {
      await this.objetivoUsuarioRepository.remove(objetivo);
    }
  }
}