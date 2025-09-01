import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class CookieAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Primero intenta obtener el token del header de autorización
    let token = request.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.substring(7); // Elimina 'Bearer ' del inicio
      request.headers.authorization = `Bearer ${token}`;
      return super.canActivate(context);
    }

    // 2. Si no hay token en el header, busca en las cookies
    token = request.cookies?.access_token;
    if (token) {
      // Establecer el token en el header para que JwtStrategy pueda leerlo
      request.headers.authorization = `Bearer ${token}`;
      return super.canActivate(context);
    }

    // 3. Si no hay token en ningún lugar
    throw new UnauthorizedException('Token no proporcionado');
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido o expirado');
    }
    return user;
  }
}
