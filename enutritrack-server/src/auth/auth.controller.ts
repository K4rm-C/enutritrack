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

// DTO para login
interface LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const loginResult = await this.authService.login(req.user);

    res.cookie('access_token', loginResult.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { user: loginResult.user };
  }

  @Post('login-manual')
  async loginManual(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const loginResult = await this.authService.login(user);

    res.cookie('access_token', loginResult.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { user: loginResult.user };
  }

  @Post('logout')
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const token = req.cookies?.access_token;
    const userId = (req.user as any)?.sub;
    // Limpiar cookie
    res.clearCookie('access_token');
    // Limpiar token del cache y Couchbase
    if (token) {
      await this.authService.logout(token, userId);
    }

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

  @Get('me')
  @UseGuards(CookieAuthGuard)
  async getCurrentUser(@Req() req: express.Request) {
    return { user: req.user };
  }

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
      const payload = {
        email: (user as any).email,
        sub: (user as any).sub,
        nombre: (user as any).nombre,
      };

      const newToken = this.authService.generateToken(payload);

      await this.authService.logout(currentToken, (user as any).sub);

      res.cookie('access_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return {
        message: 'Token refrescado exitosamente',
        user: {
          id: (user as any).sub,
          email: (user as any).email,
          nombre: (user as any).nombre,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Error al refrescar token');
    }
  }

  @Get('sessions')
  @UseGuards(CookieAuthGuard)
  async getUserSessions(@Req() req: express.Request) {
    const userId = (req.user as any)?.sub;

    if (!userId) {
      throw new UnauthorizedException('Usuario no válido');
    }

    const sessions = await this.authService.getUserSessions(userId);
    return { sessions };
  }

  @Post('logout-all')
  @UseGuards(CookieAuthGuard)
  async logoutAll(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const userId = (req.user as any)?.sub;
    const currentToken = req.cookies?.access_token;

    if (!userId) {
      throw new UnauthorizedException('Usuario no válido');
    }

    await this.authService.logout(currentToken, userId);

    // Limpiar cookie actual
    res.clearCookie('access_token');

    return { message: 'Todas las sesiones han sido cerradas' };
  }
}
