import {
  Controller,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
  Get,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica un usuario (paciente o doctor) y genera tokens de acceso',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      json: {
        summary: 'Ejemplo JSON - Paciente',
        value: {
          email: 'paciente@ejemplo.com',
          password: 'password123',
          userType: 'user',
        },
      },
      xml: {
        summary: 'Ejemplo XML - Doctor',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<LoginDto>
  <email>doctor@ejemplo.com</email>
  <password>password123</password>
  <userType>doctor</userType>
</LoginDto>`,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso, tokens generados',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'usuario@ejemplo.com',
          nombre: 'Juan Pérez',
          userType: 'user',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
    schema: {
      example: {
        statusCode: 401,
        message: 'Credenciales inválidas',
        error: 'Unauthorized',
      },
    },
  })
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    console.log(
      `🔐 Intento de login para: ${loginDto.email} como ${loginDto.userType || 'auto-detect'}`,
    );

    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.userType,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return await this.authService.login(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refrescar tokens',
    description:
      'Genera nuevos tokens de acceso usando un refresh token válido',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
    examples: {
      json: {
        summary: 'Ejemplo JSON',
        value: {
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      xml: {
        summary: 'Ejemplo XML',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <refresh_token>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</refresh_token>
</request>`,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refrescados exitosamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'usuario@ejemplo.com',
          nombre: 'Juan Pérez',
          userType: 'user',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  async refreshTokens(@Body() refreshDto: { refresh_token: string }) {
    return this.authService.refreshTokens(refreshDto.refresh_token);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validar token',
    description:
      'Valida un token de acceso y retorna la información del usuario',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
    examples: {
      json: {
        summary: 'Ejemplo JSON',
        value: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      xml: {
        summary: 'Ejemplo XML',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <token>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</token>
</request>`,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    schema: {
      example: {
        valid: true,
        user: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          email: 'usuario@ejemplo.com',
          nombre: 'Juan Pérez',
          userType: 'user',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Token inválido',
        error: 'Unauthorized',
      },
    },
  })
  async validateToken(@Body() validateDto: { token: string }) {
    try {
      const user = await this.authService.validateToken(validateDto.token);
      return { valid: true, user };
    } catch (error) {
      console.error('💥 Token validation error:', error.message);
      throw new UnauthorizedException('Token inválido');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener usuario actual',
    description:
      'Retorna la información del usuario autenticado a partir del token',
  })
  @ApiResponse({
    status: 200,
    description: 'Información del usuario obtenida exitosamente',
    schema: {
      example: {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'usuario@ejemplo.com',
          nombre: 'Juan Pérez',
          userType: 'user',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token no proporcionado o inválido',
  })
  async getCurrentUser(@Request() req) {
    // req.user viene del JwtAuthGuard
    return { user: req.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Endpoint informativo para logout. El cliente debe eliminar los tokens localmente',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout exitoso (informático)',
    schema: {
      example: {
        message: 'Logout exitoso - Eliminar tokens del cliente',
      },
    },
  })
  async logout() {
    console.log('🚪 Logout request received');
    return { message: 'Logout exitoso - Eliminar tokens del cliente' };
  }

  @Get('health/check')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Health Check',
    description: 'Verifica el estado del microservicio de autenticación',
  })
  @ApiResponse({
    status: 200,
    description: 'Microservicio funcionando correctamente',
    schema: {
      example: {
        status: 'online',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 3600,
        service: 'Microservicio de Autenticación',
        version: '1.1.0',
      },
    },
  })
  healthCheck() {
    return this.authService.healthCheck();
  }
}
