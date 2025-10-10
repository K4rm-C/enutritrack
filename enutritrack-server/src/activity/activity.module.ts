// src/physical-activity/physical-activity.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PhysicalActivityService } from './activity.service';
import { PhysicalActivityController } from './activity.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { CouchbaseModule } from '../couchbase/couchbase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActividadFisica } from './models/activity.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActividadFisica]),
    CacheModule.register(),
    HttpModule,
    CouchbaseModule,
  ],
  controllers: [PhysicalActivityController],
  providers: [PhysicalActivityService],
  exports: [PhysicalActivityService],
})
export class PhysicalActivityModule {}
