import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsService } from './alertas.service';
import { AlertsController } from './alertas.controller';
import { Alert } from './models/alertas.model';
import { AlertType } from './models/tipos_alerta.model';
import { AlertCategory } from './models/categorias_alerta.model';
import { AlertPriority } from './models/niveles_prioridad_alerta.model';
import { AlertState } from './models/estados_alerta.model';
import { AlertAction } from './models/alertas_acciones.model';
import { AutomaticAlertConfig } from './models/configuracion_alertas_automaticas.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Alert,
      AlertType,
      AlertCategory,
      AlertPriority,
      AlertState,
      AlertAction,
      AutomaticAlertConfig,
    ]),
  ],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
