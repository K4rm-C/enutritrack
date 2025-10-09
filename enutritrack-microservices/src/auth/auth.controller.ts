import {
  Controller,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
  Get,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
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

    return await this.authService.login(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() refreshDto: { refresh_token: string }) {
    return this.authService.refreshTokens(refreshDto.refresh_token);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateToken(@Body() validateDto: { token: string }) {
    try {
      const user = await this.authService.validateToken(validateDto.token);
      return { valid: true, user };
    } catch (error) {
      console.error('💥 Token validation error:', error.message);
      throw new UnauthorizedException('Token inválido');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Request() req) {
    // req.user viene del JwtAuthGuard
    return { user: req.user };
  }

  // Opcional: Endpoint para logout (solo informativo para el frontend)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    console.log('🚪 Logout request received');
    return { message: 'Logout exitoso - Eliminar tokens del cliente' };
  }
}
