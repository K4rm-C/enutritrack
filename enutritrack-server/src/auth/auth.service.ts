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
  private readonly AUTH_SERVICE_URL = 'http://localhost:3000'; // URL del microservicio

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private couchbaseService: CouchbaseService,
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.contraseñaHash))) {
      const { contraseñaHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      nombre: user.nombre,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
      },
    };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async logout(token: string, userId?: string): Promise<void> {
    try {
      // Eliminar token de Redis
      await this.cacheManager.del(`auth:token:${token}`);

      // Marcar sesiones como inactivas en Couchbase si tenemos userId
      if (userId) {
        // Esto requeriría una búsqueda más compleja en Couchbase
        // Por simplicidad, solo eliminamos del cache
        await this.markSessionsInactive(userId);
      }

      // Opcional: notificar al microservicio
      try {
        await firstValueFrom(
          this.httpService.post(`${this.AUTH_SERVICE_URL}/auth/logout`, {
            token,
            userId,
          }),
        );
      } catch (error) {
        console.warn('Error notifying microservice about logout:', error);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  async getUserSessions(userId: string) {
    // Obtener sesiones activas del usuario desde cache
    try {
      const sessions = await this.cacheManager.get(`user:sessions:${userId}`);
      if (sessions) {
        return sessions;
      }
    } catch (error) {
      console.warn('Error getting sessions from cache:', error);
    }

    // Si no está en cache, podrías consultar Couchbase
    // Para simplicidad, devolvemos array vacío
    return [];
  }

  private async markSessionsInactive(userId: string) {
    // Lógica para marcar sesiones como inactivas en Couchbase
    // Esto es opcional y depende de tus requisitos
    try {
      // Eliminar sesiones del cache del usuario
      await this.cacheManager.del(`user:sessions:${userId}`);
    } catch (error) {
      console.warn('Error marking sessions inactive:', error);
    }
  }

  // Método para limpiar tokens expirados (puedes ejecutarlo periódicamente)
  async cleanupExpiredTokens() {
    // Esta lógica dependería de cómo implementes la limpieza
    // Redis maneja TTL automáticamente, pero Couchbase podría necesitar limpieza manual
    console.log('Cleaning up expired tokens...');
  }

  // Método de utilidad para obtener información del usuario desde el token
  async getUserFromToken(token: string) {
    const tokenData = await this.validateToken(token);

    // Opcionalmente, obtener información completa del usuario
    // desde el microservicio de usuarios
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://localhost:4001/users/${tokenData.userId}`),
      );
      return response.data;
    } catch (error) {
      return tokenData; // Devolver solo los datos del token si falla
    }
  }
}
