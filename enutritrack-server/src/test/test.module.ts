import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { UserModule } from '../users/users.module';
import { CouchbaseModule } from '../couchbase/couchbase.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [UserModule, CouchbaseModule, RedisModule],
  controllers: [TestController],
})
export class TestModule {}
