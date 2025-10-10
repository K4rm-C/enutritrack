import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlimentosService } from './alimento.service';
import { AlimentosController } from './alimento.controller';
import { Alimento } from './models/alimento.model';

@Module({
  imports: [TypeOrmModule.forFeature([Alimento])],
  controllers: [AlimentosController],
  providers: [AlimentosService],
  exports: [AlimentosService],
})
export class AlimentosModule {}
