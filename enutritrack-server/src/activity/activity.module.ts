// src/physical-activity/physical-activity.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhysicalActivityService } from './activity.service';
import { PhysicalActivityController } from './activity.controller';
import { PhysicalActivity } from './models/activity.model';
import { User } from '../users/models/user.model';

@Module({
  imports: [TypeOrmModule.forFeature([PhysicalActivity, User])],
  controllers: [PhysicalActivityController],
  providers: [PhysicalActivityService],
  exports: [PhysicalActivityService],
})
export class PhysicalActivityModule {}
