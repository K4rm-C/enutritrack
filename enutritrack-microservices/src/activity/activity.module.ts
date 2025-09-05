// src/physical-activity/physical-activity.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhysicalActivityService } from './activity.service';
import { PhysicalActivityController } from './activity.controller';
import { PhysicalActivity } from './models/activity.model';
import { User } from '../users/models/user.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([PhysicalActivity, User]), AuthModule],
  controllers: [PhysicalActivityController],
  providers: [PhysicalActivityService],
  exports: [PhysicalActivityService],
})
export class PhysicalActivityModule {}
