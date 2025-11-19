import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhysicalActivityService } from './activity.service';
import { PhysicalActivityController } from './activity.controller';
import { PhysicalActivity } from './models/activity.model';
import { ActivityType } from './models/tipos_actividad.model';

@Module({
  imports: [TypeOrmModule.forFeature([PhysicalActivity, ActivityType])],
  controllers: [PhysicalActivityController],
  providers: [PhysicalActivityService],
  exports: [PhysicalActivityService],
})
export class PhysicalActivityModule {}
