import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadosAlertaService } from './estados-alerta.service';
import { EstadosAlertaController } from './estados-alerta.controller';
import { EstadoAlerta } from './models/estados-alerta.model';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoAlerta])],
  controllers: [EstadosAlertaController],
  providers: [EstadosAlertaService],
  exports: [EstadosAlertaService],
})
export class EstadosAlertaModule {}
