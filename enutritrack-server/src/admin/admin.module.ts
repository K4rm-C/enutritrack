import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './models/admin.model';
import { RedisModule } from '../redis/redis.module';
import { CouchbaseModule } from '../couchbase/couchbase.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    HttpModule,
    RedisModule,
    CouchbaseModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService, TypeOrmModule],
})
export class AdminModule {}
