import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposAlertaService } from './tipos-alerta.service';
import { TiposAlertaController } from './tipos-alerta.controller';
import { TipoAlerta } from './models/tipos-alerta.model';
import { CategoriasAlertaModule } from '../categorias-alerta/categorias-alerta.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TipoAlerta]),
    CategoriasAlertaModule
  ],
  controllers: [TiposAlertaController],
  providers: [TiposAlertaService],
  exports: [TiposAlertaService],
})
export class TiposAlertaModule {}
