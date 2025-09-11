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
  ValidationPipe,
} from '@nestjs/common';
import express from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    console.log(
      `🔐 Intento de login para: ${loginDto.email} como ${loginDto.userType || 'auto-detect'}`,
    );

    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.userType,
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

    return {
      message: 'Login exitoso',
      user: loginResult.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    console.log('🚪 Logout request received');
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
