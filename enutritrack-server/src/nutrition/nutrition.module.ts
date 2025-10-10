import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroComidaService } from './nutrition.service';
import { RegistroComidaController } from './nutrition.controller';
import { RegistroComida } from './models/nutrition.model';
import { RegistroComidaItemsModule } from '../registro-comida-item/registro-comida-item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegistroComida]),
    RegistroComidaItemsModule,
  ],
  controllers: [RegistroComidaController],
  providers: [RegistroComidaService],
  exports: [RegistroComidaService],
})
export class RegistroComidaModule {}
