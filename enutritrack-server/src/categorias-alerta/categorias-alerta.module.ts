import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriasAlertaService } from './categorias-alerta.service';
import { CategoriasAlertaController } from './categorias-alerta.controller';
import { CategoriaAlerta } from './models/categorias-alerta.model';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaAlerta])],
  controllers: [CategoriasAlertaController],
  providers: [CategoriasAlertaService],
  exports: [CategoriasAlertaService],
})
export class CategoriasAlertaModule {}
