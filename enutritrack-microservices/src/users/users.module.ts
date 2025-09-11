import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.model';
import { CouchbaseModule } from '../couchbase/couchbase.module';
import { RedisModule } from '../redis/redis.module';
import { HttpModule } from '@nestjs/axios';
import { TestController } from '../test/test.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { DoctorModule } from '../doctor/doctor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CacheModule.register(),
    HttpModule,
    CouchbaseModule,
    RedisModule,
    DoctorModule,
  ],
  providers: [UserService],
  controllers: [UsersController, TestController],
  exports: [UserService],
})
export class UserModule {}
