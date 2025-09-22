import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/users.service';
import { DoctorService } from '../doctor/doctor.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async validateUser(
    email: string,
    password: string,
    userType?: 'user' | 'doctor',
  ): Promise<AuthUser | null> {
    try {
      console.log(`🔍 Validando ${userType || 'usuario/doctor'}: ${email}`);

      // Usar la función SQL para validar credenciales
      const result = await this.dataSource.query(
        'SELECT * FROM validate_user_login($1, $2, $3)',
        [email, password, userType]
      ) as Array<{
        id: string;
        email: string;
        nombre: string;
        user_type: string;
        is_valid: boolean;
        error_message: string;
      }>;

      if (!result[0]?.is_valid) {
        console.log(`❌ Validación fallida: ${result[0]?.error_message || 'Error desconocido'}`);
        return null;
      }

      console.log(`✅ ${result[0].user_type} validado exitosamente: ${email}`);

      return {
        id: result[0].id,
        email: result[0].email,
        nombre: result[0].nombre,
        userType: result[0].user_type as 'user' | 'doctor',
      };
    } catch (error) {
      console.error('💥 Error en validateUser:', error);
      return null;
    }
  }

  // Los demás métodos se mantienen EXACTAMENTE igual
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