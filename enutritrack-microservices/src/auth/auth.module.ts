import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../users/users.module';
import { DoctorModule } from '../doctor/doctor.module'; // Asegúrate de que exista
import { JwtStrategy } from '../auth/strategies/jwt.strategies';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CookieAuthGuard } from './guards/cookie-auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategies';

@Module({
  imports: [
    UserModule,
    DoctorModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'tu_clave_secreta_super_segura',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    CookieAuthGuard,
    AuthService,
  ],
  exports: [JwtAuthGuard, CookieAuthGuard, JwtModule, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
