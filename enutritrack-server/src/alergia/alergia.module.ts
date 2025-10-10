import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlergiasService } from './alergia.service';
import { AlergiasController } from './alergia.controller';
import { Alergia } from './models/alergia.model';

@Module({
  imports: [TypeOrmModule.forFeature([Alergia])],
  controllers: [AlergiasController],
  providers: [AlergiasService],
  exports: [AlergiasService],
})
export class AlergiasModule {}
