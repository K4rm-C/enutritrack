// src/medical-history/medical-history.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MedicalHistoryService } from './medical-history.service';
import { MedicalHistoryController } from './medical-history.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { CouchbaseModule } from '../couchbase/couchbase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalHistory } from './model/medical-history.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalHistory]),
    CacheModule.register(),
    HttpModule,
    CouchbaseModule,
  ],
  controllers: [MedicalHistoryController],
  providers: [MedicalHistoryService],
  exports: [MedicalHistoryService],
})
export class MedicalHistoryModule {}
