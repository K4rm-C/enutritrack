// src/nutrition/nutrition.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';
import { FoodRecord } from './models/nutrition.model';
import { User } from '../users/models/user.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([FoodRecord, User]), AuthModule],
  controllers: [NutritionController],
  providers: [NutritionService],
  exports: [NutritionService],
})
export class NutritionModule {}
