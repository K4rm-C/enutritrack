import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateFoodRecordDto } from './dto/create-food-record.dto';
import { FoodRecord } from './models/nutrition.model';

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(FoodRecord)
    private readonly foodRecordRepository: Repository<FoodRecord>,
  ) {}

  async create(createFoodRecordDto: CreateFoodRecordDto): Promise<FoodRecord> {
    try {
      const foodRecord = this.foodRecordRepository.create({
        ...createFoodRecordDto,
        fecha: new Date(),
      });

      const savedRecord = await this.foodRecordRepository.save(foodRecord);
      return savedRecord;
    } catch (error) {
      console.error('Error creating food record:', error);
      throw new HttpException(
        'Failed to create food record',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    updateFoodRecordDto: Partial<CreateFoodRecordDto>,
  ): Promise<FoodRecord> {
    try {
      const foodRecord = await this.foodRecordRepository.findOne({
        where: { id },
      });

      if (!foodRecord) {
        throw new HttpException('Food record not found', HttpStatus.NOT_FOUND);
      }

      await this.foodRecordRepository.update(id, updateFoodRecordDto);
      const updatedRecord = await this.foodRecordRepository.findOne({
        where: { id },
      });

      if (!updatedRecord) {
        throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
      }

      return updatedRecord;
    } catch (error) {
      console.error('Error updating food record:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to update food record',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllByUser(usuarioId: string): Promise<FoodRecord[]> {
    try {
      const records = await this.foodRecordRepository.find({
        where: { usuario: { id: usuarioId } },
        order: { created_at: 'DESC' },
      });

      return records;
    } catch (error) {
      console.error('Error fetching food records:', error);
      throw new HttpException(
        'Failed to fetch food records',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<FoodRecord> {
    try {
      const record = await this.foodRecordRepository.findOne({
        where: { id },
      });

      if (!record) {
        throw new HttpException('Food record not found', HttpStatus.NOT_FOUND);
      }

      return record;
    } catch (error) {
      console.error('Error fetching food record:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to fetch food record',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const record = await this.foodRecordRepository.findOne({
        where: { id },
      });

      if (!record) {
        throw new HttpException('Food record not found', HttpStatus.NOT_FOUND);
      }

      await this.foodRecordRepository.delete(id);
    } catch (error) {
      console.error('Error deleting food record:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to delete food record',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDailySummary(usuarioId: string, date: Date): Promise<any> {
    try {
      // Consultar registros del día
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const records = await this.foodRecordRepository.find({
        where: {
          usuario: { id: usuarioId },
          fecha: Between(startOfDay, endOfDay),
        },
      });

      // Calcular totales
      const totalCalorias = records.reduce(
        (sum, record) => sum + (record.calorias || 0),
        0,
      );
      const totalProteinas = records.reduce(
        (sum, record) => sum + (record.proteinas || 0),
        0,
      );
      const totalCarbohidratos = records.reduce(
        (sum, record) => sum + (record.carbohidratos || 0),
        0,
      );
      const totalGrasas = records.reduce(
        (sum, record) => sum + (record.grasas || 0),
        0,
      );

      const summary = {
        totalCalorias,
        totalProteinas,
        totalCarbohidratos,
        totalGrasas,
        numeroComidas: records.length,
        fecha: date.toISOString(),
        registros: records,
      };

      return summary;
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      throw new HttpException(
        'Failed to fetch daily summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
