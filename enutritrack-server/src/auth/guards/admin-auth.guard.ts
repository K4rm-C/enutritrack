import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const isAdmin = await this.authService.validateAdmin(user.id);
    if (!isAdmin) {
      throw new ForbiddenException(
        'Solo los administradores pueden acceder a este recurso',
      );
    }

    return true;
  }
}
