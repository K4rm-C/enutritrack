import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { RegistroComida } from './models/nutrition.model';
import { CreateRegistroComidaDto } from './dto/create-food-record.dto';
import { UpdateRegistroComidaDto } from './dto/update-food-record.dto';
import { RegistroComidaItemsService } from '../registro-comida-item/registro-comida-item.service';
import { TipoComidaEnum } from '../shared/enum';

@Injectable()
export class RegistroComidaService {
  constructor(
    @InjectRepository(RegistroComida)
    private readonly registroComidaRepository: Repository<RegistroComida>,
    private readonly registroComidaItemsService: RegistroComidaItemsService,
  ) {}

  async create(
    createRegistroComidaDto: CreateRegistroComidaDto,
  ): Promise<RegistroComida> {
    const registroComida = this.registroComidaRepository.create(
      createRegistroComidaDto,
    );
    return await this.registroComidaRepository.save(registroComida);
  }

  async findAll(): Promise<RegistroComida[]> {
    return await this.registroComidaRepository.find({
      relations: ['usuario', 'items', 'items.alimento'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: string): Promise<RegistroComida> {
    const registroComida = await this.registroComidaRepository.findOne({
      where: { id },
      relations: ['usuario', 'items', 'items.alimento'],
    });
    if (!registroComida) {
      throw new NotFoundException('Registro de comida no encontrado');
    }
    return registroComida;
  }

  async findByUsuarioId(usuarioId: string): Promise<RegistroComida[]> {
    return await this.registroComidaRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: ['usuario', 'items', 'items.alimento'],
      order: { fecha: 'DESC' },
    });
  }

  async findByTipoComida(
    usuarioId: string,
    tipoComida: TipoComidaEnum, // Cambiar de string a TipoComidaEnum
  ): Promise<RegistroComida[]> {
    return await this.registroComidaRepository.find({
      where: { usuario: { id: usuarioId }, tipo_comida: tipoComida },
      relations: ['usuario', 'items', 'items.alimento'],
      order: { fecha: 'DESC' },
    });
  }

  async findByRangoFechas(
    usuarioId: string,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<RegistroComida[]> {
    return await this.registroComidaRepository.find({
      where: {
        usuario: { id: usuarioId },
        fecha: Between(fechaInicio, fechaFin),
      },
      relations: ['usuario', 'items', 'items.alimento'],
      order: { fecha: 'ASC' },
    });
  }

  async calcularResumenNutricional(
    usuarioId: string,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<any> {
    const registros = await this.findByRangoFechas(
      usuarioId,
      fechaInicio,
      fechaFin,
    );

    const resumen = {
      total_calorias: 0,
      total_proteinas: 0,
      total_carbohidratos: 0,
      total_grasas: 0,
      registros_por_tipo: {},
    };

    for (const registro of registros) {
      const totalNutricional =
        await this.registroComidaItemsService.calcularTotalNutricional(
          registro.id,
        );

      resumen.total_calorias += totalNutricional.calorias_totales;
      resumen.total_proteinas += totalNutricional.proteinas_totales;
      resumen.total_carbohidratos += totalNutricional.carbohidratos_totales;
      resumen.total_grasas += totalNutricional.grasas_totales;

      if (!resumen.registros_por_tipo[registro.tipo_comida]) {
        resumen.registros_por_tipo[registro.tipo_comida] = {
          cantidad: 0,
          calorias: 0,
        };
      }

      resumen.registros_por_tipo[registro.tipo_comida].cantidad++;
      resumen.registros_por_tipo[registro.tipo_comida].calorias +=
        totalNutricional.calorias_totales;
    }

    return resumen;
  }

  async update(
    id: string,
    updateRegistroComidaDto: UpdateRegistroComidaDto,
  ): Promise<RegistroComida> {
    const registroComida = await this.findOne(id);
    Object.assign(registroComida, updateRegistroComidaDto);
    return await this.registroComidaRepository.save(registroComida);
  }

  async remove(id: string): Promise<void> {
    const registroComida = await this.findOne(id);
    // Eliminar items primero
    await this.registroComidaItemsService.removeByRegistroComidaId(id);
    await this.registroComidaRepository.remove(registroComida);
  }
}
