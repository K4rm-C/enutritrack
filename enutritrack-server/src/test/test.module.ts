import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { UsersModule } from '../users/user.module';
import { CouchbaseModule } from '../couchbase/couchbase.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [UsersModule, CouchbaseModule, RedisModule],
  controllers: [TestController],
})
export class TestModule {}
