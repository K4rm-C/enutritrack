// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const loginResult = await this.authService.login(req.user);

    // Establecer la cookie con el token
    res.cookie('access_token', loginResult.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Usar secure en producción
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    // Devolver el usuario sin el token en el cuerpo
    return { user: loginResult.user };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: express.Response) {
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
      const user = await this.authService.validateToken(token);
      return { valid: true, user };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
