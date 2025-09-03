// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../users/users.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategies';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CookieAuthGuard } from './guards/cookie-auth.guard';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: 'tu_clave_secreta_super_segura',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard, CookieAuthGuard],
  exports: [JwtAuthGuard, CookieAuthGuard, JwtModule],
})
export class AuthModule {}
