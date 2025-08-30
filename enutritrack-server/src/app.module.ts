// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

// Módulos locales (proxy a microservicios)
import { UsersModule } from './users/user.module';
/* import { NutritionModule } from './nutrition/nutrition.module';
import { ActivityModule } from './activity/activity.module';
import { MedicalHistoryModule } from './medical-history/medical-history.module'; */
import { RecommendationModule } from './recommendation/recommendation.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { CouchbaseModule } from './couchbase/couchbase.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'enutritrack',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    RedisModule,
    CouchbaseModule,
    UsersModule,
    HttpModule,
    RedisModule,
    AuthModule,
    /*     NutritionModule,
    ActivityModule,
    MedicalHistoryModule, */
    RecommendationModule,
    TestModule,
  ],
})
export class AppModule {}
