import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposActividadService } from './tipo-actividad.service';
import { TiposActividadController } from './tipo-actividad.controller';
import { TipoActividad } from './models/tipo-actividad.model';

@Module({
  imports: [TypeOrmModule.forFeature([TipoActividad])],
  controllers: [TiposActividadController],
  providers: [TiposActividadService],
  exports: [TiposActividadService],
})
export class TiposActividadModule {}
