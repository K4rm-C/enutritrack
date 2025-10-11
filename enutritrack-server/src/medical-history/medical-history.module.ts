// src/medical-history/medical-history.module.ts
// NOTA: Este modulo usa Couchbase para almacenar resumen de historial medico
// No requiere TypeORM porque no almacena en PostgreSQL
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MedicalHistoryService } from './medical-history.service';
import { MedicalHistoryController } from './medical-history.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { CouchbaseModule } from '../couchbase/couchbase.module';

@Module({
  imports: [CacheModule.register(), HttpModule, CouchbaseModule],
  controllers: [MedicalHistoryController],
  providers: [MedicalHistoryService],
  exports: [MedicalHistoryService],
})
export class MedicalHistoryModule {}
