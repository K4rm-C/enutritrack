// src/nutrition/nutrition.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { CouchbaseModule } from '../couchbase/couchbase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodRecord } from './models/nutrition.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoodRecord]),
    CacheModule.register(),
    HttpModule,
    CouchbaseModule,
  ],
  controllers: [NutritionController],
  providers: [NutritionService],
  exports: [NutritionService],
})
export class NutritionModule {}
