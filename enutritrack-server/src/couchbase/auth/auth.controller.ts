import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { join } from 'path';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Servir página de login HTML
  @Get('login')
  loginPage(@Res() res: Response) {
    res.sendFile(join(__dirname, '../../public/auth-login.html'));
  }

  // API de login
  @Post('login')
  async adminLogin(@Body() loginDto: { email: string; password: string }) {
    const admin = await this.authService.validateAdmin(
      loginDto.email,
      loginDto.password,
    );

    if (!admin) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.authService.login(admin);
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshDto: { refresh_token: string }) {
    return this.authService.refreshTokens(refreshDto.refresh_token);
  }
}
