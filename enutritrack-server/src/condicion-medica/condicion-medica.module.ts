import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CondicionesMedicasService } from './condicion-medica.service';
import { CondicionesMedicasController } from './condicion-medica.controller';
import { CondicionMedica } from './models/condicion-medica.model';

@Module({
  imports: [TypeOrmModule.forFeature([CondicionMedica])],
  controllers: [CondicionesMedicasController],
  providers: [CondicionesMedicasService],
  exports: [CondicionesMedicasService],
})
export class CondicionesMedicasModule {}
