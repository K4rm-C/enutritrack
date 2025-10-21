import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposConsultaService } from './tipos-consulta.service';
import { TiposConsultaController } from './tipos-consulta.controller';
import { TipoConsulta } from './models/tipos-consulta.model';

@Module({
  imports: [TypeOrmModule.forFeature([TipoConsulta])],
  controllers: [TiposConsultaController],
  providers: [TiposConsultaService],
  exports: [TiposConsultaService],
})
export class TiposConsultaModule {}
