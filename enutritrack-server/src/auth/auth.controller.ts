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

    // Ya no establecemos cookies, solo retornamos el token
    return {
      message: 'Login exitoso',
      access_token: loginResult.access_token, // Ahora enviamos el token en la respuesta
      user: loginResult.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    console.log('🚪 Logout request received');
    // Ya no limpiamos cookies, el cliente se encarga de limpiar localStorage
    console.log('✅ Logout processed successfully');
    return { message: 'Logout exitoso' };
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateToken(@Req() req: express.Request) {
    // Buscar token en el header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.substring(7);

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
    // Buscar token en el header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.substring(7);

    try {
      const user = await this.authService.getUserFromToken(token);
      return { user };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}