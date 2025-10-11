import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroComidaItem } from './models/registro-comida-item.model';
import { Alimento } from '../alimento/models/alimento.model';
import { CreateRegistroComidaItemDto } from './dto/create-registro-comida-item.dto';
import { UpdateRegistroComidaItemDto } from './dto/update-registro-comida-item.dto';

@Injectable()
export class RegistroComidaItemsService {
  constructor(
    @InjectRepository(RegistroComidaItem)
    private readonly registroComidaItemRepository: Repository<RegistroComidaItem>,
    @InjectRepository(Alimento)
    private readonly alimentoRepository: Repository<Alimento>,
  ) {}

  /**
   * Calcula valores nutricionales basados en la cantidad de gramos y el alimento
   */
  private calcularValoresNutricionales(
    alimento: Alimento,
    cantidad_gramos: number,
  ) {
    const factor = cantidad_gramos / 100;
    return {
      calorias: Number((alimento.calorias_por_100g * factor).toFixed(2)),
      proteinas_g: Number((alimento.proteinas_g_por_100g * factor).toFixed(2)),
      carbohidratos_g: Number(
        (alimento.carbohidratos_g_por_100g * factor).toFixed(2),
      ),
      grasas_g: Number((alimento.grasas_g_por_100g * factor).toFixed(2)),
      fibra_g: alimento.fibra_g_por_100g
        ? Number((alimento.fibra_g_por_100g * factor).toFixed(2))
        : undefined,
    };
  }

  async create(
    createRegistroComidaItemDto: CreateRegistroComidaItemDto,
  ): Promise<RegistroComidaItem> {
    // Buscar el alimento para obtener sus valores nutricionales
    const alimento = await this.alimentoRepository.findOne({
      where: { id: createRegistroComidaItemDto.alimento_id },
    });

    if (!alimento) {
      throw new NotFoundException('Alimento no encontrado');
    }

    // Calcular valores nutricionales para el snapshot
    const valoresNutricionales = this.calcularValoresNutricionales(
      alimento,
      createRegistroComidaItemDto.cantidad_gramos,
    );

    // Crear el item con los valores calculados
    const registroComidaItem = this.registroComidaItemRepository.create({
      ...createRegistroComidaItemDto,
      ...valoresNutricionales,
    });

    return await this.registroComidaItemRepository.save(registroComidaItem);
  }

  async createMultiple(
    items: CreateRegistroComidaItemDto[],
  ): Promise<RegistroComidaItem[]> {
    // Procesar cada item para calcular sus valores nutricionales
    const itemsConValores = await Promise.all(
      items.map(async (item) => {
        const alimento = await this.alimentoRepository.findOne({
          where: { id: item.alimento_id },
        });

        if (!alimento) {
          throw new NotFoundException(
            `Alimento ${item.alimento_id} no encontrado`,
          );
        }

        const valoresNutricionales = this.calcularValoresNutricionales(
          alimento,
          item.cantidad_gramos,
        );

        return {
          ...item,
          ...valoresNutricionales,
        };
      }),
    );

    const registrosComidaItems =
      this.registroComidaItemRepository.create(itemsConValores);
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
    fibra_totales: number;
  }> {
    const items = await this.findByRegistroComidaId(registroComidaId);

    // Usar los valores calculados guardados (snapshot) en lugar de recalcular
    const total = items.reduce(
      (acc, item) => {
        return {
          calorias_totales: acc.calorias_totales + (item.calorias || 0),
          proteinas_totales: acc.proteinas_totales + (item.proteinas_g || 0),
          carbohidratos_totales:
            acc.carbohidratos_totales + (item.carbohidratos_g || 0),
          grasas_totales: acc.grasas_totales + (item.grasas_g || 0),
          fibra_totales: acc.fibra_totales + (item.fibra_g || 0),
        };
      },
      {
        calorias_totales: 0,
        proteinas_totales: 0,
        carbohidratos_totales: 0,
        grasas_totales: 0,
        fibra_totales: 0,
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
