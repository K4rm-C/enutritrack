// src/nutrition/foods.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Food } from './models/alimentos.model';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';

@Injectable()
export class FoodsService {
  constructor(
    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
  ) {}

  async create(createFoodDto: CreateFoodDto): Promise<Food> {
    const food = this.foodRepository.create(createFoodDto);
    return this.foodRepository.save(food);
  }

  async findAll(): Promise<Food[]> {
    return this.foodRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async search(query: string): Promise<Food[]> {
    return this.foodRepository.find({
      where: [
        { nombre: ILike(`%${query}%`) },
        { categoria: ILike(`%${query}%`) },
      ],
      take: 20,
      order: { nombre: 'ASC' },
    });
  }

  async findByCategory(category: string): Promise<Food[]> {
    return this.foodRepository.find({
      where: { categoria: ILike(`%${category}%`) },
      take: 50,
    });
  }

  async findOne(id: string): Promise<Food> {
    const food = await this.foodRepository.findOne({
      where: { id },
    });

    if (!food) {
      throw new NotFoundException('Alimento no encontrado');
    }

    return food;
  }

  async update(id: string, updateFoodDto: UpdateFoodDto): Promise<Food> {
    const food = await this.findOne(id);
    Object.assign(food, updateFoodDto);
    return this.foodRepository.save(food);
  }

  async remove(id: string): Promise<void> {
    const food = await this.findOne(id);
    await this.foodRepository.remove(food);
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.foodRepository
      .createQueryBuilder('food')
      .select('DISTINCT food.categoria', 'categoria')
      .where('food.categoria IS NOT NULL')
      .orderBy('categoria', 'ASC')
      .getRawMany();

    return categories.map((cat) => cat.categoria);
  }
}
