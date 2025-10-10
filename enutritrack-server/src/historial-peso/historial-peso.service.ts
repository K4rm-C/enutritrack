import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HistorialPeso } from './models/historial-peso.model';
import { CreateHistorialPesoDto } from './dto/create-historial-peso.dto';
import { UpdateHistorialPesoDto } from './dto/update-historial-peso.dto';

@Injectable()
export class HistorialPesoService {
  constructor(
    @InjectRepository(HistorialPeso)
    private readonly historialPesoRepository: Repository<HistorialPeso>,
  ) {}

  async create(
    createHistorialPesoDto: CreateHistorialPesoDto,
  ): Promise<HistorialPeso> {
    const historialPeso = this.historialPesoRepository.create(
      createHistorialPesoDto,
    );
    return await this.historialPesoRepository.save(historialPeso);
  }

  async findAll(): Promise<HistorialPeso[]> {
    return await this.historialPesoRepository.find({
      relations: ['usuario'],
      order: { fecha_registro: 'DESC' },
    });
  }

  async findOne(id: string): Promise<HistorialPeso> {
    const historialPeso = await this.historialPesoRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!historialPeso) {
      throw new NotFoundException('Registro de peso no encontrado');
    }
    return historialPeso;
  }

  async findByUsuarioId(usuarioId: string): Promise<HistorialPeso[]> {
    return await this.historialPesoRepository.find({
      where: { usuario_id: usuarioId },
      relations: ['usuario'],
      order: { fecha_registro: 'DESC' },
    });
  }

  async findUltimoRegistro(usuarioId: string): Promise<HistorialPeso> {
    const historial = await this.historialPesoRepository.findOne({
      where: { usuario_id: usuarioId },
      order: { fecha_registro: 'DESC' },
    });
    if (!historial) {
      throw new NotFoundException(
        'No se encontraron registros de peso para el usuario',
      );
    }
    return historial;
  }

  async findByRangoFechas(
    usuarioId: string,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<HistorialPeso[]> {
    return await this.historialPesoRepository.find({
      where: {
        usuario_id: usuarioId,
        fecha_registro: Between(fechaInicio, fechaFin),
      },
      order: { fecha_registro: 'ASC' },
    });
  }

  async update(
    id: string,
    updateHistorialPesoDto: UpdateHistorialPesoDto,
  ): Promise<HistorialPeso> {
    const historialPeso = await this.findOne(id);
    Object.assign(historialPeso, updateHistorialPesoDto);
    return await this.historialPesoRepository.save(historialPeso);
  }

  async remove(id: string): Promise<void> {
    const historialPeso = await this.findOne(id);
    await this.historialPesoRepository.remove(historialPeso);
  }
}
