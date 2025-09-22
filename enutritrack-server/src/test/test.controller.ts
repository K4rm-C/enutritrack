import { Controller, Get } from '@nestjs/common';
import { UserService } from '../users/users.service';

@Controller('test')
export class TestController {
  constructor(private userService: UserService) {}

  @Get('couchbase')
  async testCouchbase() {
    const isConnected = await this.userService.testCouchbaseConnection();
    return {
      service: 'couchbase',
      status: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('redis')
  async testRedis() {
    const isConnected = await this.userService.testRedisConnection();
    return {
      service: 'redis',
      status: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('all')
  async testAll() {
    const couchbaseStatus = await this.userService.testCouchbaseConnection();
    const redisStatus = await this.userService.testRedisConnection();

    return {
      couchbase: couchbaseStatus ? 'connected' : 'disconnected',
      redis: redisStatus ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}
