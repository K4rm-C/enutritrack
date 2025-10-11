import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../../admin/admin.service';
import * as bcrypt from 'bcrypt';

export interface AuthAdmin {
  id: string;
  email: string;
  nombre: string;
  userType: 'admin';
}

interface TokenPayload {
  email: string;
  sub: string;
  nombre: string;
  userType: 'admin';
  iat: number;
  type: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(
    email: string,
    password: string,
  ): Promise<AuthAdmin | null> {
    try {
      console.log(`🔍 Validando admin: ${email}`);

      const admin = await this.adminService.findByEmailWithPassword(email);

      if (!admin) {
        console.log(`❌ Admin no encontrado: ${email}`);
        return null;
      }

      if (!admin.passwordHash) {
        console.log(`❌ ${email} no tiene password hasheado`);
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        admin.passwordHash,
      );

      if (!isPasswordValid) {
        console.log(`❌ Contraseña incorrecta para: ${email}`);
        return null;
      }

      console.log(`✅ Admin validado exitosamente: ${email}`);

      const { passwordHash, ...result } = admin;
      return {
        ...result,
        userType: 'admin',
      };
    } catch (error) {
      console.error('💥 Error en validateAdmin:', error);
      return null;
    }
  }

  async login(admin: AuthAdmin) {
    if (!admin || !admin.email || !admin.id) {
      console.log('❌ Datos de admin inválidos para login');
      throw new UnauthorizedException('Datos de admin inválidos');
    }

    const accessToken = this.generateAccessToken(admin);
    const refreshToken = this.generateRefreshToken(admin);

    console.log(`✅ Tokens generados exitosamente para admin: ${admin.email}`);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      admin: {
        id: admin.id,
        email: admin.email,
        nombre: admin.nombre,
        userType: admin.userType,
      },
    };
  }

  private generateAccessToken(admin: AuthAdmin): string {
    const payload: TokenPayload = {
      email: admin.email,
      sub: admin.id,
      nombre: admin.nombre,
      userType: 'admin',
      iat: Math.floor(Date.now() / 1000),
      type: 'access',
    };

    return this.jwtService.sign(payload, { expiresIn: '15m' }); // 15 minutos
  }

  private generateRefreshToken(admin: AuthAdmin): string {
    const payload: TokenPayload = {
      email: admin.email,
      sub: admin.id,
      nombre: admin.nombre,
      userType: 'admin',
      iat: Math.floor(Date.now() / 1000),
      type: 'refresh',
    };

    return this.jwtService.sign(payload, { expiresIn: '7d' }); // 7 días
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken) as TokenPayload;

      // Verificar que es un refresh token
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido para refresh');
      }

      // Verificar que el token es de un admin
      if (payload.userType !== 'admin') {
        throw new UnauthorizedException('Token no es de administrador');
      }

      const admin = await this.adminService.findById(payload.sub);

      if (!admin) {
        throw new UnauthorizedException('Admin no encontrado');
      }

      console.log(`✅ Refresh token válido para admin: ${admin.email}`);

      const authAdmin: AuthAdmin = {
        id: admin.id,
        email: admin.email,
        nombre: admin.nombre,
        userType: 'admin',
      };

      const newAccessToken = this.generateAccessToken(authAdmin);
      const newRefreshToken = this.generateRefreshToken(authAdmin);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        admin: {
          id: authAdmin.id,
          email: authAdmin.email,
          nombre: authAdmin.nombre,
          userType: authAdmin.userType,
        },
      };
    } catch (error) {
      console.error('💥 Error en refreshTokens:', error);
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token) as TokenPayload;

      // Solo permitir tokens de acceso para operaciones normales
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Tipo de token inválido');
      }

      return {
        adminId: payload.sub,
        email: payload.email,
        nombre: payload.nombre,
        userType: payload.userType,
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async getAdminFromToken(token: string): Promise<AuthAdmin> {
    try {
      const payload = this.jwtService.verify(token) as TokenPayload;

      // Solo permite tokens de acceso
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Token no es de acceso');
      }

      // Solo permite tokens de admin
      if (payload.userType !== 'admin') {
        throw new UnauthorizedException('Token no es de administrador');
      }

      const admin = await this.adminService.findById(payload.sub);

      if (!admin) {
        throw new UnauthorizedException('Admin no encontrado');
      }

      console.log(`✅ Admin obtenido del token: ${admin.email}`);
      const { passwordHash, ...result } = admin;
      return {
        ...result,
        userType: 'admin',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('💥 Error en getAdminFromToken:', error);
      throw new UnauthorizedException('Token inválido');
    }
  }

  // Método para validar contraseña (ya que eliminamos validatePassword de AdminService)
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  }
}
