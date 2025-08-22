// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './users/users.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { MedicalHistoryModule } from './medical-history/medical-history.module';
import { PhysicalActivityModule } from './activity/activity.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
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
    UserModule,
    AuthModule,
    NutritionModule,
    MedicalHistoryModule,
    PhysicalActivityModule,
    RecommendationModule,
  ],
})
export class AppModule {}
