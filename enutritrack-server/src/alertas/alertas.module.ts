import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertasService } from './alertas.service';
import { AlertasController } from './alertas.controller';
import { Alerta } from './models/alertas.model';
import { AlertasAccionesModule } from '../alertas-acciones/alertas-acciones.module';
import { AlertaAccion } from '../alertas-acciones/models/alertas-acciones.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alerta, AlertaAccion]),
    AlertasAccionesModule
  ],
  controllers: [AlertasController],
  providers: [AlertasService],
  exports: [AlertasService],
})
export class AlertasModule {}
