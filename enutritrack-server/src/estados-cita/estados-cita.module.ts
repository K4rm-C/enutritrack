import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadosCitaService } from './estados-cita.service';
import { EstadosCitaController } from './estados-cita.controller';
import { EstadoCita } from './models/estados-cita.model';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoCita])],
  controllers: [EstadosCitaController],
  providers: [EstadosCitaService],
  exports: [EstadosCitaService],
})
export class EstadosCitaModule {}
