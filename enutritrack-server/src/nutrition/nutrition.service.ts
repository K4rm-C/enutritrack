// src/nutrition/nutrition.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodRecord } from './models/nutrition.model';
import { CreateFoodRecordDto } from './dto/create-food-record.dto';
import { UpdateFoodRecordDto } from './dto/update-food-record.dto';
import { User } from '../users/models/user.model';

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(FoodRecord)
    private foodRecordRepository: Repository<FoodRecord>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createFoodRecordDto: CreateFoodRecordDto): Promise<FoodRecord> {
    const user = await this.userRepository.findOne({
      where: { id: createFoodRecordDto.usuarioId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const foodRecord = this.foodRecordRepository.create({
      ...createFoodRecordDto,
      usuario: user,
    });

    return this.foodRecordRepository.save(foodRecord);
  }

  async findAllByUser(userId: string): Promise<FoodRecord[]> {
    return this.foodRecordRepository.find({
      where: { usuario: { id: userId } },
      relations: ['usuario'],
    });
  }

  async findOne(id: string): Promise<FoodRecord> {
    const foodRecord = await this.foodRecordRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!foodRecord) {
      throw new NotFoundException('Registro de comida no encontrado');
    }

    return foodRecord;
  }

  async update(
    id: string,
    updateFoodRecordDto: UpdateFoodRecordDto,
  ): Promise<FoodRecord> {
    const foodRecord = await this.findOne(id);

    if (updateFoodRecordDto.usuarioId) {
      const user = await this.userRepository.findOne({
        where: { id: updateFoodRecordDto.usuarioId },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      foodRecord.usuario = user;
    }

    Object.assign(foodRecord, updateFoodRecordDto);

    return this.foodRecordRepository.save(foodRecord);
  }

  async remove(id: string): Promise<void> {
    const foodRecord = await this.findOne(id);
    await this.foodRecordRepository.remove(foodRecord);
  }

  async getDailySummary(userId: string, date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await this.foodRecordRepository
      .createQueryBuilder('record')
      .where('record.usuarioId = :userId', { userId })
      .andWhere('record.fecha BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .getMany();

    const summary = records.reduce(
      (acc, record) => {
        acc.calorias += record.calorias;
        acc.proteinas += record.proteinas;
        acc.carbohidratos += record.carbohidratos;
        acc.grasas += record.grasas;
        return acc;
      },
      { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 },
    );

    return summary;
  }
}
