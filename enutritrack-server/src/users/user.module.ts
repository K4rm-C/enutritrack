import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { CouchbaseModule } from '../couchbase/couchbase.module'; // Ajusta la ruta según tu estructura
import { TestController } from 'src/test/test.controller';

@Module({
  imports: [
    CacheModule.register(),
    HttpModule,
    CouchbaseModule, // ← Importa el módulo que proporciona CouchbaseService
  ],
  controllers: [UsersController, TestController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
