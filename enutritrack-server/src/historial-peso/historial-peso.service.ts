import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HistorialPeso } from './models/historial-peso.model';

@Injectable()
export class HistorialPesoService {
  constructor(
    @InjectRepository(HistorialPeso)
    private readonly historialPesoRepository: Repository<HistorialPeso>,
  ) {}

  async findByUsuarioId(usuarioId: string): Promise<HistorialPeso[]> {
    return await this.historialPesoRepository.find({
      where: { usuario_id: usuarioId },
      order: { fecha_registro: 'DESC' },
    });
  }

  async getUltimoPeso(usuarioId: string): Promise<HistorialPeso | null> {
    return await this.historialPesoRepository.findOne({
      where: { usuario_id: usuarioId },
      order: { fecha_registro: 'DESC' },
    });
  }

  async create(pesoData: Partial<HistorialPeso>): Promise<HistorialPeso> {
    const peso = this.historialPesoRepository.create(pesoData);
    return await this.historialPesoRepository.save(peso);
  }

  async update(id: string, pesoData: Partial<HistorialPeso>): Promise<HistorialPeso | null> {
    await this.historialPesoRepository.update(id, pesoData);
    return await this.historialPesoRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<HistorialPeso[]> {
    return await this.historialPesoRepository.find({
      order: { fecha_registro: 'DESC' },
    });
  }

  async findOne(id: string): Promise<HistorialPeso | null> {
    const peso = await this.historialPesoRepository.findOne({ where: { id } });
    if (!peso) {
      throw new NotFoundException('Registro de peso no encontrado');
    }
    return peso;
  }

  async findUltimoRegistro(usuarioId: string): Promise<HistorialPeso | null> {
    return await this.historialPesoRepository.findOne({
      where: { usuario_id: usuarioId },
      order: { fecha_registro: 'DESC' },
    });
  }

  async findByRangoFechas(usuarioId: string, fechaInicio: Date, fechaFin: Date): Promise<HistorialPeso[]> {
    return await this.historialPesoRepository.find({
      where: {
        usuario_id: usuarioId,
        fecha_registro: Between(fechaInicio, fechaFin),
      },
      order: { fecha_registro: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    const peso = await this.findOne(id);
    if (peso) {
      await this.historialPesoRepository.remove(peso);
    }
  }
}