import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertasAccionesService } from './alertas-acciones.service';
import { AlertasAccionesController } from './alertas-acciones.controller';
import { AlertaAccion } from './models/alertas-acciones.model';

@Module({
  imports: [TypeOrmModule.forFeature([AlertaAccion])],
  controllers: [AlertasAccionesController],
  providers: [AlertasAccionesService],
  exports: [AlertasAccionesService],
})
export class AlertasAccionesModule {}
