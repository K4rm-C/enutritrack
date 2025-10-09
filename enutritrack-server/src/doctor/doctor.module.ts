import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './models/doctor.model';
import { RedisModule } from '../redis/redis.module';
import { CouchbaseModule } from '../couchbase/couchbase.module';
import { AdminModule } from 'src/admin/admin.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor]),
    HttpModule,
    RedisModule,
    CouchbaseModule,
    AdminModule,
  ],
  providers: [DoctorService],
  controllers: [DoctorController],
  exports: [DoctorService, TypeOrmModule],
})
export class DoctorModule {}
