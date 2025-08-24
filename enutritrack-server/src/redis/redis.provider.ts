import { Provider } from '@nestjs/common';
import * as redis from 'redis';

export const RedisProvider: Provider = {
  provide: 'RedisClient',
  useFactory: () => {
    const client = redis.createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      password: process.env.REDIS_PASSWORD,
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    return client;
  },
};
