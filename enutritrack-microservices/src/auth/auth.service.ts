import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/users.service';
import { DoctorService } from '../doctor/doctor.service';
import * as bcrypt from 'bcrypt';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  userType: 'user' | 'doctor';
}

interface TokenPayload {
  email: string;
  sub: string;
  nombre: string;
  userType: 'user' | 'doctor';
  iat: number;
  type: 'access' | 'refresh';
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

      // Buscar con el tipo específico si se proporciona
      if (userType) {
        if (userType === 'user') {
          user = await this.userService.findByEmailWithPassword(email);
          actualUserType = 'user';
        } else {
          user = await this.doctorService.findByEmailWithPassword(email);
          actualUserType = 'doctor';
        }
      } else {
        // Auto-detectar tipo
        user = await this.userService.findByEmailWithPassword(email);
        if (user) {
          actualUserType = 'user';
        } else {
          user = await this.doctorService.findByEmailWithPassword(email);
          if (user) {
            actualUserType = 'doctor';
          } else {
            console.log(`❌ Usuario/Doctor no encontrado: ${email}`);
            return null;
          }
        }
      }

      if (!user) {
        console.log(
          `❌ ${userType || 'Usuario/Doctor'} no encontrado: ${email}`,
        );
        return null;
      }

      if (!user.passwordHash) {
        console.log(`❌ ${email} no tiene password hasheado`);
        return null;
      }

      // Validar contraseña usando bcrypt directamente
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        console.log(`❌ Contraseña incorrecta para: ${email}`);
        return null;
      }

      console.log(
        `✅ ${actualUserType === 'user' ? 'Usuario' : 'Doctor'} validado exitosamente: ${email}`,
      );

      const { passwordHash, ...result } = user;
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

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    console.log(
      `✅ Tokens generados exitosamente para ${user.userType}: ${user.email}`,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        userType: user.userType,
      },
    };
  }

  private generateAccessToken(user: AuthUser): string {
    const payload: TokenPayload = {
      email: user.email,
      sub: user.id,
      nombre: user.nombre,
      userType: user.userType,
      iat: Math.floor(Date.now() / 1000),
      type: 'access',
    };

    return this.jwtService.sign(payload, { expiresIn: '15m' }); // 15 minutos
  }

  private generateRefreshToken(user: AuthUser): string {
    const payload: TokenPayload = {
      email: user.email,
      sub: user.id,
      nombre: user.nombre,
      userType: user.userType,
      iat: Math.floor(Date.now() / 1000),
      type: 'refresh',
    };

    return this.jwtService.sign(payload, { expiresIn: '7d' }); // 7 días
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      // Verificar que es un refresh token
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido para refresh');
      }

      let user: AuthUser;

      // Buscar usuario según el tipo
      if (payload.userType === 'user') {
        const userData = await this.userService.findById(payload.sub);
        if (!userData || !userData.cuenta) {
          throw new UnauthorizedException('Usuario no encontrado');
        }
        user = {
          id: userData.id,
          email: userData.cuenta.email,
          nombre: userData.nombre,
          userType: 'user',
        };
      } else {
        const doctorData = await this.doctorService.findById(payload.sub);
        if (!doctorData || !doctorData.cuenta) {
          throw new UnauthorizedException('Doctor no encontrado');
        }
        user = {
          id: doctorData.id,
          email: doctorData.cuenta.email,
          nombre: doctorData.nombre,
          userType: 'doctor',
        };
      }

      console.log(
        `✅ Refresh token válido para ${user.userType}: ${user.email}`,
      );

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          userType: user.userType,
        },
      };
    } catch (error) {
      console.error('💥 Error en refreshTokens:', error);
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      // Solo permitir tokens de acceso para operaciones normales
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Tipo de token inválido');
      }

      return {
        userId: payload.sub,
        email: payload.email,
        nombre: payload.nombre,
        userType: payload.userType,
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async getUserFromToken(token: string): Promise<AuthUser> {
    try {
      const payload = this.jwtService.verify(token);

      // Solo permite tokens de acceso
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Token no es de acceso');
      }

      let user: any;
      if (payload.userType === 'user') {
        user = await this.userService.findById(payload.sub);
      } else {
        user = await this.doctorService.findById(payload.sub);
      }

      if (!user || !user.cuenta) {
        throw new UnauthorizedException(
          `${payload.userType === 'user' ? 'Usuario' : 'Doctor'} no encontrado`,
        );
      }

      console.log(
        `✅ ${payload.userType === 'user' ? 'Usuario' : 'Doctor'} obtenido del token: ${user.cuenta.email}`,
      );

      // Eliminar datos sensibles antes de devolver
      const result = { ...user };
      if (result.cuenta) {
        const { password_hash, ...cuentaSinPassword } = result.cuenta;
        result.cuenta = cuentaSinPassword;
      }

      return {
        ...result,
        userType: payload.userType,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('💥 Error en getUserFromToken:', error);
      throw new UnauthorizedException('Token inválido');
    }
  }

  async healthCheck() {
    const startTime = Date.now();

    const uptime = Math.floor((Date.now() - startTime) / 1000);

    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      service: process.env.SERVICE_NAME || 'Microservicio de Autenticación',
      version: process.env.APP_VERSION || '1.1.0',
    };
  }
}
