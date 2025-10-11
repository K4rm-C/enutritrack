import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CuentasService } from '../cuentas/cuentas.service';
import { RedisService } from '../redis/redis.service';
import { LoginCuentaDto } from '../cuentas/dto/login-cuenta.dto';
import { TipoCuentaEnum } from '../shared/enum';

@Injectable()
export class AuthService {
  constructor(
    private cuentasService: CuentasService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async login(loginCuentaDto: LoginCuentaDto) {
    const user = await this.cuentasService.validateUser(loginCuentaDto);
    if (user.tipo_cuenta !== TipoCuentaEnum.ADMIN) {
      throw new ForbiddenException(
        'Solo los administradores pueden acceder al CMS',
      );
    }
    const payload = {
      email: user.email,
      sub: user.id,
      tipo_cuenta: user.tipo_cuenta,
    };

    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Guardar tokens en Redis
    await this.redisService.set(`access_token:${user.id}`, access_token, 900); // 15 minutos
    await this.redisService.set(
      `refresh_token:${user.id}`,
      refresh_token,
      604800,
    ); // 7 días

    console.log(`✅ Tokens guardados en Redis para usuario: ${user.email}`);

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        tipo_cuenta: user.tipo_cuenta,
      },
    };
  }

  async refreshToken(oldRefreshToken: string) {
    try {
      const payload = this.jwtService.verify(oldRefreshToken);
      const userId = payload.sub;

      // Verificar que el refresh token esté en Redis
      const storedRefreshToken = await this.redisService.get(
        `refresh_token:${userId}`,
      );
      if (storedRefreshToken !== oldRefreshToken) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      // Generar nuevos tokens
      const newPayload = {
        email: payload.email,
        sub: payload.sub,
        tipo_cuenta: payload.tipo_cuenta,
      };
      const access_token = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });
      const refresh_token = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      });

      // Actualizar en Redis
      await this.redisService.set(`access_token:${userId}`, access_token, 900);
      await this.redisService.set(
        `refresh_token:${userId}`,
        refresh_token,
        604800,
      );

      console.log(`✅ Tokens actualizados en Redis para usuario ID: ${userId}`);

      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async logout(userId: string) {
    await this.redisService.del(`access_token:${userId}`);
    await this.redisService.del(`refresh_token:${userId}`);

    console.log(`✅ Tokens eliminados de Redis para usuario ID: ${userId}`);

    return { message: 'Logout exitoso' };
  }

  async validateToken(userId: string, token: string): Promise<boolean> {
    const storedToken = await this.redisService.get(`access_token:${userId}`);
    return storedToken === token;
  }

  async getProfile(userId: string) {
    const user = await this.cuentasService.findOne(userId);
    const { password_hash, ...result } = user;
    return result;
  }

  // Validar que el usuario es admin
  async validateAdmin(userId: string): Promise<boolean> {
    const user = await this.cuentasService.findOne(userId);
    return user.tipo_cuenta === TipoCuentaEnum.ADMIN;
  }
}
