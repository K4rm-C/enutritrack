import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilUsuario } from '../../users/models/user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    @InjectRepository(PerfilUsuario)
    private readonly perfilUsuarioRepository: Repository<PerfilUsuario>,
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
    // CASO 1: Token de usuario normal (desde microservicio)
    // El payload.sub es usuario_id (perfil_usuario.id)
    if (payload.userType === 'user' && payload.sub) {
      // Buscar el perfil de usuario por ID (usuario_id)
      const perfilUsuario = await this.perfilUsuarioRepository.findOne({
        where: { id: payload.sub },
        relations: ['cuenta'], // Cargar la relación con cuenta
      });

      if (!perfilUsuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      if (!perfilUsuario.cuenta) {
        throw new UnauthorizedException('Cuenta asociada no encontrada');
      }

      if (!perfilUsuario.cuenta.activa) {
        throw new UnauthorizedException('Cuenta inactiva');
      }

      // Retornar información del usuario normal CON cuenta_id
      return {
        id: payload.sub, // usuario_id (para compatibilidad con endpoints)
        cuenta_id: perfilUsuario.cuenta_id, // IMPORTANTE: cuenta_id para validaciones internas
        usuario_id: payload.sub, // También incluir explícitamente
        email: payload.email || perfilUsuario.cuenta.email,
        tipo_cuenta: perfilUsuario.cuenta.tipo_cuenta,
        userType: 'user',
        isAdmin: false,
      };
    }

    // CASO 2: Token de admin (comportamiento original)
    // El payload.sub es cuenta_id directamente
    const isValidAdmin = await this.authService.validateAdmin(payload.sub);
    if (!isValidAdmin) {
      throw new UnauthorizedException('Usuario no autorizado para el CMS');
    }

    return {
      id: payload.sub, // cuenta_id
      cuenta_id: payload.sub, // También como cuenta_id para consistencia
      email: payload.email,
      tipo_cuenta: payload.tipo_cuenta,
      isAdmin: true,
    };
  }
}
