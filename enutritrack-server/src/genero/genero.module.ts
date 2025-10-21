import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneroService } from './genero.service';
import { GeneroController } from './genero.controller';
import { Genero } from './models/genero.model';

@Module({
  imports: [TypeOrmModule.forFeature([Genero])],
  controllers: [GeneroController],
  providers: [GeneroService],
  exports: [GeneroService],
})
export class GeneroModule {}
