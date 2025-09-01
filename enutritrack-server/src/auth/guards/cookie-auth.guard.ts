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

    let token = request.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.substring(7);
      request.headers.authorization = `Bearer ${token}`;
      return super.canActivate(context);
    }

    token = request.cookies?.access_token;
    if (token) {
      request.headers.authorization = `Bearer ${token}`;
      return super.canActivate(context);
    }

    throw new UnauthorizedException('Token no proporcionado');
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido o expirado');
    }
    return user;
  }
}
