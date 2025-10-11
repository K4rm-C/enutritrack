import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DashboardController } from './dashboard.controller';
import { JwtStrategy } from './strategies/jwt.strategies';
import { CuentasModule } from '../cuentas/cuentas.module';
import { RedisModule } from '../redis/redis.module';
import { PerfilAdmin } from '../admin/models/admin.model';
import { PerfilDoctor } from '../doctor/models/doctor.model';
import { PerfilUsuario } from '../users/models/user.model';

@Module({
  imports: [
    CuentasModule,
    PassportModule,
    RedisModule,
    TypeOrmModule.forFeature([PerfilAdmin, PerfilDoctor, PerfilUsuario]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'tu_clave_secreta_super_segura',
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController, DashboardController],
  exports: [AuthService],
})
export class AuthModule {}
