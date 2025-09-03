// enutritrack-microservices/src/auth/guards/cookie-auth.guard.ts
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

    // Buscar token en múltiples lugares
    let token = null;

    // 1. Buscar en cookies
    if (request.cookies && request.cookies.access_token) {
      token = request.cookies.access_token;
    }

    // 2. Buscar en header Authorization
    if (!token && request.headers.authorization) {
      const authHeader = request.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // 3. Buscar directamente en headers
    if (!token && request.headers['x-access-token']) {
      token = request.headers['x-access-token'];
    }

    console.log('Auth Guard - Token search:', {
      cookies: request.cookies,
      authHeader: request.headers.authorization,
      tokenFound: !!token,
      url: request.url,
      method: request.method,
    });

    if (!token) {
      console.error('Token no proporcionado');
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'tu_clave_secreta_super_segura',
      });

      request.user = payload;
      console.log('Token verificado exitosamente:', payload);
      return true;
    } catch (error) {
      console.error('Error verificando token:', error.message);
      throw new UnauthorizedException('Token inválido');
    }
  }
}
