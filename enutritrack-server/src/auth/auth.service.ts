// backend/src/auth/auth.service.ts
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CouchbaseService } from '../couchbase/couchbase.service';

@Injectable()
export class AuthService {
  private readonly AUTH_SERVICE_URL = 'http://localhost:4000'; // URL del microservicio

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private couchbaseService: CouchbaseService,
  ) {}

  async login(credentials: { email: string; password: string }) {
    // Hacer login en el microservicio
    const response = await firstValueFrom(
      this.httpService.post(`${this.AUTH_SERVICE_URL}/auth/login`, credentials),
    );

    const { access_token, user } = response.data;

    // Almacenar token en Redis para validaciones rápidas (1 hora)
    await this.cacheManager.set(
      `auth:token:${access_token}`,
      {
        userId: user.id,
        email: user.email,
        nombre: user.nombre,
      },
      3600,
    );

    // Registrar sesión en Couchbase para auditoría
    const sessionData = {
      userId: user.id,
      email: user.email,
      token: access_token,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      userAgent: '', // Puedes añadir más información si está disponible
      ipAddress: '',
      active: true,
    };

    try {
      await this.couchbaseService.upsertDocument(
        `session::${user.id}::${Date.now()}`,
        sessionData,
      );
    } catch (error) {
      console.warn('Error saving session to Couchbase:', error);
    }

    return {
      access_token,
      user,
    };
  }

  async validateToken(token: string) {
    // Primero verificar en Redis cache
    const cachedToken = await this.cacheManager.get(`auth:token:${token}`);

    if (cachedToken) {
      console.log('Token found in cache');
      return cachedToken;
    }

    console.log('Token not in cache, validating with microservice');

    // Si no está en cache, validar con el microservicio
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.AUTH_SERVICE_URL}/auth/validate`, {
          token,
        }),
      );

      const tokenData = response.data;

      // Guardar en cache para futuras validaciones
      await this.cacheManager.set(`auth:token:${token}`, tokenData, 3600);

      return tokenData;
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
