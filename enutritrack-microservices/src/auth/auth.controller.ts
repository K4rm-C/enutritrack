// microservicio/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    console.log('🔐 Login request received');

    if (!req.user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const loginResult = await this.authService.login(req.user);

    res.cookie('access_token', loginResult.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      message: 'Login exitoso',
      user: loginResult.user,
    };
  }

  // Logout completamente SIN guards - solo limpia cookie
  @Post('logout')
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    console.log('🚪 Logout request received');

    // Limpiar cookie SIEMPRE, sin validaciones
    res.clearCookie('access_token');

    console.log('✅ Cookie cleared successfully');
    return { message: 'Logout exitoso' };
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateToken(@Req() req: express.Request) {
    const token = req.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const user = await this.authService.validateToken(token);
      return { valid: true, user };
    } catch (error) {
      console.error('💥 Token validation error:', error.message);
      throw new UnauthorizedException('Token inválido');
    }
  }

  // Endpoint sin guards para obtener usuario
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Req() req: express.Request) {
    const token = req.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const user = await this.authService.getUserFromToken(token);
      return { user };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
