import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationsService } from './recommendation.service';
import { RecommendationsController } from './recommendation.controller';
import { Recommendation } from './models/recommendation.model';
import { RecommendationType } from './models/tipos_recomendacion.model';
import { RecommendationData } from './models/recomendacion_datos';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recommendation,
      RecommendationType,
      RecommendationData,
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationModule {}
