import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposRecomendacionService } from './tipo-recomendacion.service';
import { TiposRecomendacionController } from './tipo-recomendacion.controller';
import { TipoRecomendacion } from './models/tipo-recomendacion.model';

@Module({
  imports: [TypeOrmModule.forFeature([TipoRecomendacion])],
  controllers: [TiposRecomendacionController],
  providers: [TiposRecomendacionService],
  exports: [TiposRecomendacionService],
})
export class TiposRecomendacionModule {}
