import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Buscar token en diferentes lugares
    let token = null;

    // 1. Buscar en header Authorization (Bearer token)
    if (request.headers.authorization) {
      const authHeader = request.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // 2. Buscar directamente en headers (como fallback)
    if (!token && request.headers['x-access-token']) {
      token = request.headers['x-access-token'];
    }

    // 3. Buscar en cookies como última opción
    if (!token && request.cookies && request.cookies['access_token']) {
      token = request.cookies['access_token'];
    }

    console.log('Auth Guard - Token search:', {
      authHeader: request.headers.authorization,
      xAccessToken: request.headers['x-access-token'],
      cookieToken: request.cookies?.['access_token'],
      tokenFound: !!token,
      url: request.url,
      method: request.method,
    });

    if (!token) {
      console.error('Token no proporcionado en ningún lugar');
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'tu_clave_secreta_super_segura',
      });

      // Agregar información del usuario a la request
      request.user = payload;
      console.log('Token verificado exitosamente:', payload);
      return true;
    } catch (error) {
      console.error('Error verificando token:', error.message);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}