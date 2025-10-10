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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  loginPage(@Res() res: Response) {
    res.sendFile(join(__dirname, '../../public/login.html'));
  }

  @Post('login')
  async login(@Body() loginCuentaDto: LoginCuentaDto) {
    return this.authService.login(loginCuentaDto);
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
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
