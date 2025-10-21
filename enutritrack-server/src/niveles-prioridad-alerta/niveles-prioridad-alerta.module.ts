import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NivelesPrioridadAlertaService } from './niveles-prioridad-alerta.service';
import { NivelesPrioridadAlertaController } from './niveles-prioridad-alerta.controller';
import { NivelPrioridadAlerta } from './models/niveles-prioridad-alerta.model';

@Module({
  imports: [TypeOrmModule.forFeature([NivelPrioridadAlerta])],
  controllers: [NivelesPrioridadAlertaController],
  providers: [NivelesPrioridadAlertaService],
  exports: [NivelesPrioridadAlertaService],
})
export class NivelesPrioridadAlertaModule {}
