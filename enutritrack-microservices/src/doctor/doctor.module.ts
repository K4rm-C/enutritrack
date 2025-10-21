import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './models/doctor.model';
import { Cuenta } from '../shared/models/cuenta.model';
import { Especialidad } from '../shared/models/especialidad.model';
import { RedisModule } from '../redis/redis.module';
import { CouchbaseModule } from '../couchbase/couchbase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, Cuenta, Especialidad]),
    RedisModule,
    CouchbaseModule,
  ],
  providers: [DoctorService],
  controllers: [DoctorController],
  exports: [DoctorService, TypeOrmModule],
})
export class DoctorModule {}
