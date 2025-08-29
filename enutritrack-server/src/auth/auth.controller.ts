// backend/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CookieAuthGuard } from './guards/cookie-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    // El LocalAuthGuard ya validó las credenciales, req.user contiene los datos
    const loginResult = await this.authService.login({
      email: (req.user as any).email,
      password: '', // No necesitamos enviar la contraseña otra vez
    });

    // Establecer la cookie con el token
    res.cookie('access_token', loginResult.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    return { user: loginResult.user };
  }

  @Post('logout')
  @UseGuards(CookieAuthGuard)
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const token = req.cookies?.access_token;
    const userId = (req.user as any)?.id;

    // Limpiar token del cache y Couchbase
    if (token) {
      await this.authService.logout(token, userId);
    }

    // Limpiar cookie
    res.clearCookie('access_token');

    return { message: 'Logout exitoso' };
  }

  @Post('validate')
  async validateToken(@Req() req: express.Request) {
    const token = req.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const tokenData = await this.authService.validateToken(token);
      return { valid: true, user: tokenData };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  // Endpoint adicional para obtener información del usuario actual
  @Get('me')
  @UseGuards(CookieAuthGuard)
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

  // Endpoint para refrescar el token (opcional)
  @Post('refresh')
  @UseGuards(CookieAuthGuard)
  async refreshToken(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const currentToken = req.cookies?.access_token;
    const user = req.user;

    if (!currentToken || !user) {
      throw new UnauthorizedException('Token o usuario no válido');
    }

    try {
      // Generar nuevo token llamando al microservicio
      const loginResult = await this.authService.login({
        email: (user as any).email,
        password: '', // Solo para refrescar, no necesitamos contraseña
      });

      // Limpiar token anterior
      await this.authService.logout(currentToken, (user as any).id);

      // Establecer nueva cookie
      res.cookie('access_token', loginResult.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return {
        message: 'Token refrescado exitosamente',
        user: loginResult.user,
      };
    } catch (error) {
      throw new UnauthorizedException('Error al refrescar token');
    }
  }

  // Endpoint para obtener sesiones activas del usuario
  @Get('sessions')
  @UseGuards(CookieAuthGuard)
  async getUserSessions(@Req() req: express.Request) {
    const userId = (req.user as any)?.id;

    if (!userId) {
      throw new UnauthorizedException('Usuario no válido');
    }

    const sessions = await this.authService.getUserSessions(userId);
    return { sessions };
  }

  // Endpoint para cerrar todas las sesiones
  @Post('logout-all')
  @UseGuards(CookieAuthGuard)
  async logoutAll(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const userId = (req.user as any)?.id;
    const currentToken = req.cookies?.access_token;

    if (!userId) {
      throw new UnauthorizedException('Usuario no válido');
    }

    // Cerrar todas las sesiones del usuario
    await this.authService.logout(currentToken, userId);

    // Limpiar cookie actual
    res.clearCookie('access_token');

    return { message: 'Todas las sesiones han sido cerradas' };
  }
}
