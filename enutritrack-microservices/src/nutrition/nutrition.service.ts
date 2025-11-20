// src/nutrition/nutrition.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FoodRecord } from './models/nutrition.model';
import { FoodRecordItem } from './models/registro-comida-item.model';
import { Food } from './models/alimentos.model';
import { User } from '../users/models/user.model';
import { CreateFoodRecordDto } from './dto/create-food-record.dto';
import { UpdateFoodRecordDto } from './dto/update-food-record.dto';
import { AddFoodItemDto } from './dto/add-food-item.dto';
import { CreateFoodDto } from './dto/create-food.dto';
import { FoodsService } from './alimentos.service';

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(FoodRecord)
    private foodRecordRepository: Repository<FoodRecord>,
    @InjectRepository(FoodRecordItem)
    private foodRecordItemRepository: Repository<FoodRecordItem>,
    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private foodsService: FoodsService,
  ) {}

  async createFoodRecord(
    createFoodRecordDto: CreateFoodRecordDto,
  ): Promise<FoodRecord> {
    // Verificar que el usuario existe
    const userExists = await this.userRepository.findOne({
      where: { id: createFoodRecordDto.usuarioId },
    });

    if (!userExists) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Crear el registro con solo el ID del usuario
    const foodRecord = this.foodRecordRepository.create({
      usuario: { id: createFoodRecordDto.usuarioId }, // Solo pasamos el ID
      fecha: createFoodRecordDto.fecha || new Date(),
      tipo_comida: createFoodRecordDto.tipo_comida,
      notas: createFoodRecordDto.notas,
    });

    return this.foodRecordRepository.save(foodRecord);
  }

  async addFoodItemToRecord(
    recordId: string,
    addFoodItemDto: AddFoodItemDto,
  ): Promise<FoodRecordItem> {
    const foodRecord = await this.foodRecordRepository.findOne({
      where: { id: recordId },
    });

    if (!foodRecord) {
      throw new NotFoundException('Registro de comida no encontrado');
    }

    const food = await this.foodRepository.findOne({
      where: { id: addFoodItemDto.alimentoId },
    });

    if (!food) {
      throw new NotFoundException('Alimento no encontrado');
    }

    // Calcular nutrientes basados en la cantidad
    const factor = addFoodItemDto.cantidad_gramos / 100;
    const foodItem = this.foodRecordItemRepository.create({
      registro_comida: { id: recordId }, // Solo pasamos el ID
      alimento: { id: addFoodItemDto.alimentoId }, // Solo pasamos el ID
      cantidad_gramos: addFoodItemDto.cantidad_gramos,
      calorias: Number((food.calorias_por_100g * factor).toFixed(2)),
      proteinas_g: Number((food.proteinas_g_por_100g * factor).toFixed(2)),
      carbohidratos_g: Number(
        (food.carbohidratos_g_por_100g * factor).toFixed(2),
      ),
      grasas_g: Number((food.grasas_g_por_100g * factor).toFixed(2)),
      fibra_g: Number((food.fibra_g_por_100g * factor).toFixed(2)),
      notas: addFoodItemDto.notas,
    });

    return this.foodRecordItemRepository.save(foodItem);
  }

  async findAllByUser(userId: string): Promise<FoodRecord[]> {
    return this.foodRecordRepository.find({
      where: { usuario: { id: userId } },
      relations: ['items', 'items.alimento'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FoodRecord> {
    const foodRecord = await this.foodRecordRepository.findOne({
      where: { id },
      relations: ['items', 'items.alimento', 'usuario'],
    });

    if (!foodRecord) {
      throw new NotFoundException('Registro de comida no encontrado');
    }

    return foodRecord;
  }

  async updateFoodRecord(
    id: string,
    updateFoodRecordDto: UpdateFoodRecordDto,
  ): Promise<FoodRecord> {
    const foodRecord = await this.findOne(id);

    if (updateFoodRecordDto.usuarioId) {
      const userExists = await this.userRepository.findOne({
        where: { id: updateFoodRecordDto.usuarioId },
      });
      if (!userExists) {
        throw new NotFoundException('Usuario no encontrado');
      }
      foodRecord.usuario = { id: updateFoodRecordDto.usuarioId } as User;
    }

    Object.assign(foodRecord, updateFoodRecordDto);

    return this.foodRecordRepository.save(foodRecord);
  }

  async removeFoodItem(itemId: string): Promise<void> {
    const item = await this.foodRecordItemRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Item no encontrado');
    }

    await this.foodRecordItemRepository.remove(item);
  }

  async removeFoodRecord(id: string): Promise<void> {
    const foodRecord = await this.findOne(id);
    await this.foodRecordRepository.remove(foodRecord);
  }

  async getDailySummary(userId: string, date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await this.foodRecordRepository.find({
      where: {
        usuario: { id: userId },
        fecha: Between(startOfDay, endOfDay),
      },
      relations: ['items', 'items.alimento'],
    });

    const summary = {
      total_calorias: 0,
      total_proteinas: 0,
      total_carbohidratos: 0,
      total_grasas: 0,
      total_fibra: 0,
      comidas_por_tipo: {},
      total_comidas: records.length,
    };

    records.forEach((record) => {
      record.items.forEach((item) => {
        summary.total_calorias += Number(item.calorias) || 0;
        summary.total_proteinas += Number(item.proteinas_g) || 0;
        summary.total_carbohidratos += Number(item.carbohidratos_g) || 0;
        summary.total_grasas += Number(item.grasas_g) || 0;
        summary.total_fibra += Number(item.fibra_g) || 0;
      });

      // Contar comidas por tipo
      const tipo = String(record.tipo_comida); // Convertir enum a string explícitamente
      summary.comidas_por_tipo[tipo] =
        (summary.comidas_por_tipo[tipo] || 0) + 1;
    });

    // Redondear valores
    summary.total_calorias = Number(summary.total_calorias.toFixed(2));
    summary.total_proteinas = Number(summary.total_proteinas.toFixed(2));
    summary.total_carbohidratos = Number(
      summary.total_carbohidratos.toFixed(2),
    );
    summary.total_grasas = Number(summary.total_grasas.toFixed(2));
    summary.total_fibra = Number(summary.total_fibra.toFixed(2));

    return summary;
  }

  async searchFoods(query: string): Promise<Food[]> {
    return this.foodRepository
      .createQueryBuilder('food')
      .where('food.nombre ILIKE :query', { query: `%${query}%` })
      .orWhere('food.categoria ILIKE :query', { query: `%${query}%` })
      .limit(20)
      .getMany();
  }

  async getFoodsByCategory(category: string): Promise<Food[]> {
    return this.foodRepository.find({
      where: { categoria: category },
      take: 50,
    });
  }

  async getFoodCategories(): Promise<string[]> {
    return this.foodsService.getCategories();
  }

  async createFood(createFoodDto: CreateFoodDto): Promise<Food> {
    return this.foodsService.create(createFoodDto);
  }

  async getAllFoods(): Promise<Food[]> {
    return this.foodsService.findAll();
  }

  async healthCheck() {
    const startTime = Date.now();

    const uptime = Math.floor((Date.now() - startTime) / 1000);

    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      service: process.env.SERVICE_NAME || 'Microservicio de nutrición',
      version: process.env.APP_VERSION || '1.1.0',
    };
  }
}
