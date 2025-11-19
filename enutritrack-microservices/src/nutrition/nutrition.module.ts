// src/nutrition/nutrition.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';
import { FoodRecord } from './models/nutrition.model';
import { FoodRecordItem } from './models/registro-comida-item.model';
import { Food } from './models/alimentos.model';
import { User } from '../users/models/user.model';
import { AuthModule } from '../auth/auth.module';
import { FoodsService } from './alimentos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoodRecord, FoodRecordItem, Food, User]),
    AuthModule,
  ],
  controllers: [NutritionController],
  providers: [NutritionService, FoodsService],
  exports: [NutritionService],
})
export class NutritionModule {}
