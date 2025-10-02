// src/recommendation/recommendation.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { Recommendation } from './models/recommendation.model';
import { UserModule } from '../users/users.module';
import { MedicalHistoryModule } from '../medical-history/medical-history.module';
import { NutritionModule } from '../nutrition/nutrition.module';
import { PhysicalActivityModule } from '../activity/activity.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recommendation]),
    forwardRef(() => UserModule),
    MedicalHistoryModule,
    NutritionModule,
    PhysicalActivityModule,
    AuthModule,
  ],
  providers: [RecommendationService],
  controllers: [RecommendationController],
  exports: [RecommendationService],
})
export class RecommendationModule {}
