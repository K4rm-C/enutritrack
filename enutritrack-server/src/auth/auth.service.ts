import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/users.service';
import { DoctorService } from '../doctor/doctor.service';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  userType: 'user' | 'doctor';
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private doctorService: DoctorService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    userType?: 'user' | 'doctor',
  ): Promise<AuthUser | null> {
    try {
      console.log(`🔍 Validando ${userType || 'usuario/doctor'}: ${email}`);

      let user: any = null;
      let actualUserType: 'user' | 'doctor';

      if (userType) {
        if (userType === 'user') {
          user = await this.userService.findByEmail(email);
          actualUserType = 'user';
        } else {
          user = await this.doctorService.findByEmail(email);
          actualUserType = 'doctor';
        }
      } else {
        user = await this.userService.findByEmail(email);
        if (user) {
          actualUserType = 'user';
        } else {
          user = await this.doctorService.findByEmail(email);
          actualUserType = 'doctor';
        }
      }

      if (!user) {
        console.log(`❌ Usuario/Doctor no encontrado: ${email}`);
        return null;
      }

      if (!user.contraseñaHash) {
        console.log(`❌ ${email} no tiene contraseña hasheada`);
        return null;
      }

      let isPasswordValid: boolean;
      if (actualUserType === 'user') {
        isPasswordValid = await this.userService.validatePassword(
          password,
          user.contraseñaHash,
        );
      } else {
        const doctorPasswordResult = await this.doctorService.validatePassword(
          password,
          user.contraseñaHash,
        );
        isPasswordValid = doctorPasswordResult.isValid;
      }

      if (!isPasswordValid) {
        console.log(`❌ Contraseña incorrecta para: ${email}`);
        return null;
      }

      console.log(
        `✅ ${actualUserType === 'user' ? 'Usuario' : 'Doctor'} validado exitosamente: ${email}`,
      );

      const { contraseñaHash, ...result } = user;
      return {
        ...result,
        userType: actualUserType,
      };
    } catch (error) {
      console.error('💥 Error en validateUser:', error);
      return null;
    }
  }

  async login(user: AuthUser) {
    if (!user || !user.email || !user.id) {
      console.log('❌ Datos de usuario inválidos para login');
      throw new UnauthorizedException('Datos de usuario inválidos');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      nombre: user.nombre,
      userType: user.userType,
      iat: Math.floor(Date.now() / 1000),
    };

    try {
      const access_token = this.jwtService.sign(payload);
      console.log(
        `✅ Token generado exitosamente para ${user.userType}: ${user.email}`,
      );

      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          userType: user.userType,
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
        userType: payload.userType || 'user', // Por retrocompatibilidad
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async getUserFromToken(token: string): Promise<AuthUser> {
    try {
      const payload = this.jwtService.verify(token);
      const userType = payload.userType || 'user';

      let user: any;
      if (userType === 'user') {
        user = await this.userService.findById(payload.sub);
      } else {
        user = await this.doctorService.findById(payload.sub);
      }

      if (!user) {
        throw new UnauthorizedException(
          `${userType === 'user' ? 'Usuario' : 'Doctor'} no encontrado`,
        );
      }

      console.log(
        `✅ ${userType === 'user' ? 'Usuario' : 'Doctor'} obtenido del token: ${user.email}`,
      );
      const { contraseñaHash, ...result } = user;
      return {
        ...result,
        userType,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('💥 Error en getUserFromToken:', error);
      throw new UnauthorizedException('Token inválido');
    }
  }
}
