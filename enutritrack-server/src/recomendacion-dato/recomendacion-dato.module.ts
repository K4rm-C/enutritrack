import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecomendacionDatosService } from './recomendacion-dato.service';
import { RecomendacionDatosController } from './recomendacion-dato.controller';
import { RecomendacionDato } from './models/recomendacion-dato.model';

@Module({
  imports: [TypeOrmModule.forFeature([RecomendacionDato])],
  controllers: [RecomendacionDatosController],
  providers: [RecomendacionDatosService],
  exports: [RecomendacionDatosService],
})
export class RecomendacionDatosModule {}
