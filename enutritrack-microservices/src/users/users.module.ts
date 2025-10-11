import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.model';
import { Cuenta } from '../shared/models/cuenta.model';
import { HistorialPeso } from './models/historial-peso.model';
import { ObjetivoUsuario } from './models/objetivo-usuario.model';
import { CouchbaseModule } from '../couchbase/couchbase.module';
import { RedisModule } from '../redis/redis.module';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { DoctorModule } from '../doctor/doctor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Cuenta, HistorialPeso, ObjetivoUsuario]),
    CacheModule.register(),
    HttpModule,
    CouchbaseModule,
    RedisModule,
    DoctorModule,
  ],
  providers: [UserService],
  controllers: [UsersController],
  exports: [UserService],
})
export class UserModule {}
