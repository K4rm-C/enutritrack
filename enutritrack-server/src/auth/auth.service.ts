// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly AUTH_SERVICE_URL = 'http://localhost:3004';

  constructor(
    private httpService: HttpService,
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      console.log(`Validando usuario: ${email}`);

      const user = await this.userService.findByEmailWithPassword(email);

      if (!user) {
        console.log(`Usuario no encontrado: ${email}`);
        return null;
      }

      console.log(`Usuario encontrado: ${email}, verificando contraseña`);

      if (!user.contraseñaHash) {
        console.log(`Usuario ${email} no tiene hash de contraseña`);
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        user.contraseñaHash,
      );

      if (!isPasswordValid) {
        console.log(`Contraseña incorrecta para usuario: ${email}`);
        return null;
      }

      console.log(`Contraseña válida para usuario: ${email}`);

      const { contraseñaHash, ...result } = user;
      return result;
    } catch (error) {
      console.error('Error en validateUser:', error);
      return null;
    }
  }

  async login(user: any) {
    console.log('Iniciando login para usuario:', user?.email);

    if (!user || !user.email || !user.id) {
      console.error('Datos de usuario inválidos:', user);
      throw new UnauthorizedException('Datos de usuario inválidos');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      nombre: user.nombre,
    };

    try {
      const token = this.jwtService.sign(payload);

      console.log(`Token generado exitosamente para usuario: ${user.email}`);

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
        },
      };
    } catch (error) {
      console.error('Error generando token:', error);
      throw new UnauthorizedException('Error al generar token de acceso');
    }
  }

  generateToken(payload: any): string {
    return this.jwtService.sign(payload);
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return {
        userId: payload.sub,
        email: payload.email,
        nombre: payload.nombre,
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async logout(token: string, userId?: string): Promise<void> {
    try {
      // Notificar al microservicio sobre el logout
      try {
        await firstValueFrom(
          this.httpService.post(
            `${this.AUTH_SERVICE_URL}/auth/logout`,
            {
              token,
              userId,
            },
            {
              timeout: 5000,
            },
          ),
        );
      } catch (error) {
        console.warn('Error notifying microservice about logout:', error);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  async getUserSessions(userId: string) {
    // Sin cache, retornamos array vacío
    // Podrías implementar esto consultando directamente la base de datos
    // o manejarlo a través del microservicio
    console.log(`Getting sessions for user: ${userId}`);
    return [];
  }

  async cleanupExpiredTokens() {
    console.log('Cleaning up expired tokens...');
    // Con JWT stateless, los tokens expiran automáticamente
    // No necesitas limpiar nada manualmente
  }
}
