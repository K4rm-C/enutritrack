import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginCuentaDto } from '../cuentas/dto/login-cuenta.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { join } from 'path';
import { DataSource } from 'typeorm';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private dataSource: DataSource,
  ) {}

  @Get('login')
  loginPage(@Res() res: Response) {
    res.sendFile(join(__dirname, '../../public/login.html'));
  }

  @Get('doctors-crud.html')
  doctorPage(@Res() res: Response) {
    res.sendFile(join(__dirname, '../../public/doctors-crud.html'));
  }
  @Get('patients-crud.html')
  userPage(@Res() res: Response) {
    res.sendFile(join(__dirname, '../../public/patients-crud.html'));
  }

  @Get('dashboard')
  dashboardPage(@Res() res: Response) {
    res.sendFile(join(__dirname, '../../views/dashboard.html'));
  }

  @Post('login')
  async login(@Body() loginCuentaDto: LoginCuentaDto) {
    return this.authService.login(loginCuentaDto);
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Get('health')
  async healthCheck() {
    let dbStatus = 'disconnected';
    let dbError = null;

    try {
      // Ejecutar una consulta simple para verificar la conexión
      await this.dataSource.query('SELECT 1');
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
      dbError = error.message;
    }
    const healthInfo = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'EnutriTrack API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      rutas: {
        login: '/auth/login',
        dashboard: '/auth/dashboard',
        profile: '/auth/profile',
        refresh: '/auth/refresh',
      },
    };

    if (dbStatus === 'error') {
      return {
        status: 'ERROR',
        message: 'Service Unavailable - Database connection failed',
        timestamp: healthInfo.timestamp,
      };
    }

    return healthInfo;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    return this.authService.logout(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.authService.getProfile(req.user.id);
  }
}
