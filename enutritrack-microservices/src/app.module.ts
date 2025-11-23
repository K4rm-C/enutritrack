// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './users/users.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { MedicalHistoryModule } from './medical-history/medical-history.module';
import { PhysicalActivityModule } from './activity/activity.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorModule } from './doctor/doctor.module';
import { CitasMedicasModule } from './citas/citas-medicas.module';
import { AlertsModule } from './alertas/alertas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'enutritrack',
      password: 'enutritrack2024',
      database: 'enutritrack',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Usar migraciones en lugar de sync
      migrations: ['src/migration/*.ts'],
      autoLoadEntities: true,
    }),
    UserModule,
    DoctorModule,
    AuthModule,
    NutritionModule,
    MedicalHistoryModule,
    CitasMedicasModule,
    PhysicalActivityModule,
    RecommendationModule,
    AlertsModule,
  ],
})
export class AppModule {}
