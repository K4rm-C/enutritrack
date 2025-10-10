import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroComidaItemsService } from './registro-comida-item.service';
import { RegistroComidaItemsController } from './registro-comida-item.controller';
import { RegistroComidaItem } from './models/registro-comida-item.model';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroComidaItem])],
  controllers: [RegistroComidaItemsController],
  providers: [RegistroComidaItemsService],
  exports: [RegistroComidaItemsService],
})
export class RegistroComidaItemsModule {}
