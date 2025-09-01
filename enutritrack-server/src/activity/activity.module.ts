// src/physical-activity/physical-activity.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PhysicalActivityService } from './activity.service';
import { PhysicalActivityController } from './activity.controller';

@Module({
  imports: [HttpModule],
  controllers: [PhysicalActivityController],
  providers: [PhysicalActivityService],
  exports: [PhysicalActivityService],
})
export class PhysicalActivityModule {}
