import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicamento } from './models/medicamento.model';
import { CreateMedicamentoDto } from './dto/create-medicamento.dto';
import { UpdateMedicamentoDto } from './dto/update-medicamento.dto';

@Injectable()
export class MedicamentosService {
  constructor(
    @InjectRepository(Medicamento)
    private readonly medicamentoRepository: Repository<Medicamento>,
  ) {}

  async create(
    createMedicamentoDto: CreateMedicamentoDto,
  ): Promise<Medicamento> {
    const medicamento = this.medicamentoRepository.create(createMedicamentoDto);
    return await this.medicamentoRepository.save(medicamento);
  }

  async findAll(): Promise<Medicamento[]> {
    return await this.medicamentoRepository.find({
      relations: ['usuario'],
    });
  }

  async findOne(id: string): Promise<Medicamento> {
    const medicamento = await this.medicamentoRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!medicamento) {
      throw new NotFoundException('Medicamento no encontrado');
    }
    return medicamento;
  }

  async findByUsuarioId(usuarioId: string): Promise<Medicamento[]> {
    return await this.medicamentoRepository.find({
      where: { usuario_id: usuarioId },
      relations: ['usuario'],
    });
  }

  async findActivosByUsuarioId(usuarioId: string): Promise<Medicamento[]> {
    return await this.medicamentoRepository.find({
      where: { usuario_id: usuarioId, activo: true },
      relations: ['usuario'],
    });
  }

  async findActivosVigentes(): Promise<Medicamento[]> {
    const hoy = new Date();
    return await this.medicamentoRepository
      .createQueryBuilder('medicamento')
      .where('medicamento.activo = :activo', { activo: true })
      .andWhere(
        '(medicamento.fecha_fin IS NULL OR medicamento.fecha_fin >= :hoy)',
        { hoy },
      )
      .leftJoinAndSelect('medicamento.usuario', 'usuario')
      .getMany();
  }

  async update(
    id: string,
    updateMedicamentoDto: UpdateMedicamentoDto,
  ): Promise<Medicamento> {
    const medicamento = await this.findOne(id);
    Object.assign(medicamento, updateMedicamentoDto);
    return await this.medicamentoRepository.save(medicamento);
  }

  async remove(id: string): Promise<void> {
    const medicamento = await this.findOne(id);
    await this.medicamentoRepository.remove(medicamento);
  }

  async desactivar(id: string): Promise<Medicamento> {
    const medicamento = await this.findOne(id);
    medicamento.activo = false;
    return await this.medicamentoRepository.save(medicamento);
  }
}
