// microservicio/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      console.log(`🔍 Validando usuario: ${email}`);
      const user = await this.userService.findByEmail(email);

      if (!user) {
        console.log(`❌ Usuario no encontrado: ${email}`);
        return null;
      }

      if (!user.contraseñaHash) {
        console.log(`❌ Usuario ${email} no tiene contraseña hasheada`);
        return null;
      }

      const isPasswordValid = await this.userService.validatePassword(
        password,
        user.contraseñaHash,
      );

      if (!isPasswordValid) {
        console.log(`❌ Contraseña incorrecta para: ${email}`);
        return null;
      }

      console.log(`✅ Usuario validado exitosamente: ${email}`);
      const { contraseñaHash, ...result } = user;
      return result;
    } catch (error) {
      console.error('💥 Error en validateUser:', error);
      return null;
    }
  }

  async login(user: any) {
    if (!user || !user.email || !user.id) {
      console.log('❌ Datos de usuario inválidos para login');
      throw new UnauthorizedException('Datos de usuario inválidos');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      nombre: user.nombre,
      iat: Math.floor(Date.now() / 1000),
    };

    try {
      const access_token = this.jwtService.sign(payload);
      console.log(`✅ Token generado exitosamente para: ${user.email}`);

      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
        },
      };
    } catch (error) {
      console.error('💥 Error generando token:', error);
      throw new UnauthorizedException('Error al generar token');
    }
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

  async getUserFromToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      console.log(`✅ Usuario obtenido del token: ${user.email}`);
      const { contraseñaHash, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('💥 Error en getUserFromToken:', error);
      throw new UnauthorizedException('Token inválido');
    }
  }
}
