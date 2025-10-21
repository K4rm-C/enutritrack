import { Module } from '@nestjs/common';
import { CouchbaseAlertsCitasService } from './couchbase-alerts-citas.service';
import { CouchbaseModule } from '../couchbase/couchbase.module';

@Module({
  imports: [CouchbaseModule],
  providers: [CouchbaseAlertsCitasService],
  exports: [CouchbaseAlertsCitasService],
})
export class CouchbaseAlertsCitasModule {}
