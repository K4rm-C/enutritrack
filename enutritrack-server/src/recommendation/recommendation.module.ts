import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecomendacionService } from './recommendation.service';
import { RecomendacionController } from './recommendation.controller';
import { Recomendacion } from './models/recommendation.model';
import { RecomendacionDatosModule } from '../recomendacion-dato/recomendacion-dato.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recomendacion]),
    RecomendacionDatosModule,
  ],
  controllers: [RecomendacionController],
  providers: [RecomendacionService],
  exports: [RecomendacionService],
})
export class RecomendacionModule {}
