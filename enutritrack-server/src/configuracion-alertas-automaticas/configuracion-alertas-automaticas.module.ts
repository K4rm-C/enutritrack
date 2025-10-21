import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracionAlertasAutomaticasService } from './configuracion-alertas-automaticas.service';
import { ConfiguracionAlertasAutomaticasController } from './configuracion-alertas-automaticas.controller';
import { ConfiguracionAlertasAutomaticas } from './models/configuracion-alertas-automaticas.model';

@Module({
  imports: [TypeOrmModule.forFeature([ConfiguracionAlertasAutomaticas])],
  controllers: [ConfiguracionAlertasAutomaticasController],
  providers: [ConfiguracionAlertasAutomaticasService],
  exports: [ConfiguracionAlertasAutomaticasService],
})
export class ConfiguracionAlertasAutomaticasModule {}
