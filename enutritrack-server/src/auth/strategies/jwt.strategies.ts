import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'tu_clave_secreta_super_segura',
    });
  }

  async validate(payload: any) {
    const isValidAdmin = await this.authService.validateAdmin(payload.sub);
    if (!isValidAdmin) {
      throw new UnauthorizedException('Usuario no autorizado para el CMS');
    }

    return {
      id: payload.sub,
      email: payload.email,
      tipo_cuenta: payload.tipo_cuenta,
    };
  }
}
