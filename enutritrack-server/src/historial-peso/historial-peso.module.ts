import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialPesoService } from './historial-peso.service';
import { HistorialPesoController } from './historial-peso.controller';
import { HistorialPeso } from './models/historial-peso.model';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialPeso])],
  controllers: [HistorialPesoController],
  providers: [HistorialPesoService],
  exports: [HistorialPesoService],
})
export class HistorialPesoModule {}
