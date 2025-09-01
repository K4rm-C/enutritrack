// backend/src/auth/auth.service.ts
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CouchbaseService } from '../couchbase/couchbase.service';
import { UsersService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly AUTH_SERVICE_URL = 'http://localhost:3000';

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private couchbaseService: CouchbaseService,
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

      // Guardar token en cache con TTL
      await this.cacheManager.set(
        `auth:token:${token}`,
        { userId: user.id, email: user.email },
        24 * 60 * 60, // 24 horas en SEGUNDOS (no milisegundos)
      );

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
      const decoded = this.jwtService.verify(token);

      const cachedToken = await this.cacheManager.get(`auth:token:${token}`);
      if (!cachedToken) {
        throw new UnauthorizedException('Token revocado o expirado');
      }

      return decoded;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Error validando token:', error);
      throw new UnauthorizedException('Token inválido');
    }
  }

  async logout(token: string, userId?: string): Promise<void> {
    try {
      if (token) {
        await this.cacheManager.del(`auth:token:${token}`);
      }

      if (userId) {
        await this.markSessionsInactive(userId);
      }
      try {
        await firstValueFrom(
          this.httpService.post(
            `${this.AUTH_SERVICE_URL}/auth/logout`,
            {
              token,
              userId,
            },
            {
              timeout: 5000, // 5 segundos timeout
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
    try {
      const sessions = await this.cacheManager.get(`user:sessions:${userId}`);
      if (sessions) {
        return sessions;
      }
    } catch (error) {
      console.warn('Error getting sessions from cache:', error);
    }

    return [];
  }

  private async markSessionsInactive(userId: string) {
    try {
      await this.cacheManager.del(`user:sessions:${userId}`);
    } catch (error) {
      console.warn('Error marking sessions inactive:', error);
    }
  }

  async cleanupExpiredTokens() {
    console.log('Cleaning up expired tokens...');
  }

  async getUserFromToken(token: string) {
    try {
      const tokenData = await this.validateToken(token);

      try {
        const response = await firstValueFrom(
          this.httpService.get(
            `${this.AUTH_SERVICE_URL}/users/${tokenData.sub}`,
            {
              timeout: 5000,
            },
          ),
        );
        return response.data;
      } catch (error) {
        console.warn('Error fetching user from microservice:', error);
        return {
          id: tokenData.sub,
          email: tokenData.email,
          nombre: tokenData.nombre,
        };
      }
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
