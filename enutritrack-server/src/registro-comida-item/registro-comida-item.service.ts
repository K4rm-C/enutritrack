import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroComidaItem } from './models/registro-comida-item.model';
import { CreateRegistroComidaItemDto } from './dto/create-registro-comida-item.dto';
import { UpdateRegistroComidaItemDto } from './dto/update-registro-comida-item.dto';

@Injectable()
export class RegistroComidaItemsService {
  constructor(
    @InjectRepository(RegistroComidaItem)
    private readonly registroComidaItemRepository: Repository<RegistroComidaItem>,
  ) {}

  async create(
    createRegistroComidaItemDto: CreateRegistroComidaItemDto,
  ): Promise<RegistroComidaItem> {
    const registroComidaItem = this.registroComidaItemRepository.create(
      createRegistroComidaItemDto,
    );
    return await this.registroComidaItemRepository.save(registroComidaItem);
  }

  async createMultiple(
    items: CreateRegistroComidaItemDto[],
  ): Promise<RegistroComidaItem[]> {
    const registrosComidaItems =
      this.registroComidaItemRepository.create(items);
    return await this.registroComidaItemRepository.save(registrosComidaItems);
  }

  async findAll(): Promise<RegistroComidaItem[]> {
    return await this.registroComidaItemRepository.find({
      relations: ['registroComida', 'alimento'],
    });
  }

  async findOne(id: string): Promise<RegistroComidaItem> {
    const registroComidaItem = await this.registroComidaItemRepository.findOne({
      where: { id },
      relations: ['registroComida', 'alimento'],
    });
    if (!registroComidaItem) {
      throw new NotFoundException('Item de registro de comida no encontrado');
    }
    return registroComidaItem;
  }

  async findByRegistroComidaId(
    registroComidaId: string,
  ): Promise<RegistroComidaItem[]> {
    return await this.registroComidaItemRepository.find({
      where: { registro_comida_id: registroComidaId },
      relations: ['registroComida', 'alimento'],
    });
  }

  async calcularTotalNutricional(registroComidaId: string): Promise<{
    calorias_totales: number;
    proteinas_totales: number;
    carbohidratos_totales: number;
    grasas_totales: number;
  }> {
    const items = await this.findByRegistroComidaId(registroComidaId);

    const total = items.reduce(
      (acc, item) => {
        const factor = item.cantidad_gramos / 100;
        return {
          calorias_totales:
            acc.calorias_totales + item.alimento.calorias_por_100g * factor,
          proteinas_totales:
            acc.proteinas_totales + item.alimento.proteinas_g_por_100g * factor,
          carbohidratos_totales:
            acc.carbohidratos_totales +
            item.alimento.carbohidratos_g_por_100g * factor,
          grasas_totales:
            acc.grasas_totales + item.alimento.grasas_g_por_100g * factor,
        };
      },
      {
        calorias_totales: 0,
        proteinas_totales: 0,
        carbohidratos_totales: 0,
        grasas_totales: 0,
      },
    );

    return total;
  }

  async update(
    id: string,
    updateRegistroComidaItemDto: UpdateRegistroComidaItemDto,
  ): Promise<RegistroComidaItem> {
    const registroComidaItem = await this.findOne(id);
    Object.assign(registroComidaItem, updateRegistroComidaItemDto);
    return await this.registroComidaItemRepository.save(registroComidaItem);
  }

  async remove(id: string): Promise<void> {
    const registroComidaItem = await this.findOne(id);
    await this.registroComidaItemRepository.remove(registroComidaItem);
  }

  async removeByRegistroComidaId(registroComidaId: string): Promise<void> {
    const items = await this.findByRegistroComidaId(registroComidaId);
    await this.registroComidaItemRepository.remove(items);
  }
}
