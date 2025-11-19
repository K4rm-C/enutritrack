import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  // Endpoint público para registro - no requiere autenticación
  @Post()
  @ApiOperation({
    summary: 'Crear nuevo usuario (paciente)',
    description:
      'Endpoint público para registro de nuevos pacientes. No requiere autenticación.',
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      json: {
        summary: 'Ejemplo JSON - Registro completo',
        value: {
          nombre: 'Juan Pérez',
          email: 'juan.perez@ejemplo.com',
          password: 'password123',
          fecha_nacimiento: '1990-05-15',
          genero: 'M',
          altura: 175,
          telefono: '+1234567890',
          telefono_1: '+1234567891',
          telefono_2: '+1234567892',
          doctorId: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      xml: {
        summary: 'Ejemplo XML - Registro básico',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<CreateUserDto>
  <nombre>María García</nombre>
  <email>maria.garcia@ejemplo.com</email>
  <password>password123</password>
  <fecha_nacimiento>1985-08-20</fecha_nacimiento>
  <genero>F</genero>
  <altura>165</altura>
  <telefono>+1234567890</telefono>
</CreateUserDto>`,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Juan Pérez',
        fecha_nacimiento: '1990-05-15T00:00:00.000Z',
        genero_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        altura: 175,
        telefono: '+1234567890',
        cuenta: {
          id: '223e4567-e89b-12d3-a456-426614174000',
          email: 'juan.perez@ejemplo.com',
          tipo_cuenta: 'USUARIO',
          activa: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está registrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor no encontrado (si se proporcionó doctorId)',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Obtener todos los usuarios',
    description:
      'Retorna una lista de todos los usuarios registrados en el sistema. Requiere autenticación JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nombre: 'Juan Pérez',
          email: 'juan.perez@ejemplo.com',
          fecha_nacimiento: '1990-05-15T00:00:00.000Z',
          genero: {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            nombre: 'Masculino',
          },
          altura: 175,
          telefono: '+1234567890',
          doctor: {
            id: '323e4567-e89b-12d3-a456-426614174000',
            nombre: 'Dr. Carlos López',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido',
  })
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctor/:doctorId')
  @ApiOperation({
    summary: 'Obtener pacientes por doctor',
    description: 'Retorna todos los pacientes asignados a un doctor específico',
  })
  @ApiParam({
    name: 'doctorId',
    type: String,
    description: 'ID del doctor',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pacientes del doctor obtenida exitosamente',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nombre: 'Ana García',
          email: 'ana.garcia@ejemplo.com',
          fecha_nacimiento: '1985-08-20T00:00:00.000Z',
          genero: { nombre: 'Femenino' },
          altura: 165,
          peso_actual: 65,
          objetivo_peso: 60,
          nivel_actividad: 'moderado',
          imc: 23.9,
          telefono: '+1234567890',
          historialPeso: [
            { peso: 68, fecha_registro: '2024-01-01T00:00:00.000Z' },
            { peso: 65, fecha_registro: '2024-01-15T00:00:00.000Z' },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido',
  })
  findByDoctorId(@Param('doctorId') doctorId: string) {
    return this.userService.getPatientsByDoctorId(doctorId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('email/:email')
  @ApiOperation({
    summary: 'Buscar usuario por email',
    description:
      'Retorna un usuario específico basado en su dirección de email',
  })
  @ApiParam({
    name: 'email',
    type: String,
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Juan Pérez',
        email: 'juan.perez@ejemplo.com',
        fecha_nacimiento: '1990-05-15T00:00:00.000Z',
        genero: { nombre: 'Masculino' },
        altura: 175,
        telefono: '+1234567890',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido',
  })
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description:
      'Retorna un usuario específico con todos sus datos incluyendo historial de peso y objetivos',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado con datos completos',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Juan Pérez',
        email: 'juan.perez@ejemplo.com',
        fecha_nacimiento: '1990-05-15T00:00:00.000Z',
        genero: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          nombre: 'Masculino',
        },
        altura: 175,
        telefono: '+1234567890',
        telefono_1: '+1234567891',
        telefono_2: '+1234567892',
        peso_actual: 75,
        objetivo_peso: 70,
        nivel_actividad: 'activo',
        imc: 24.5,
        doctor: {
          id: '323e4567-e89b-12d3-a456-426614174000',
          nombre: 'Dr. Carlos López',
          especialidad: { nombre: 'Nutriología' },
        },
        historialPeso: [
          {
            id: '423e4567-e89b-12d3-a456-426614174000',
            peso: 78,
            fecha_registro: '2024-01-01T00:00:00.000Z',
            notas: 'Peso inicial',
          },
          {
            id: '523e4567-e89b-12d3-a456-426614174000',
            peso: 75,
            fecha_registro: '2024-01-15T00:00:00.000Z',
            notas: 'Actualizado desde formulario de edición',
          },
        ],
        objetivos: [
          {
            id: '623e4567-e89b-12d3-a456-426614174000',
            peso_objetivo: 70,
            nivel_actividad: 'activo',
            fecha_establecido: '2024-01-15T00:00:00.000Z',
            vigente: true,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido',
  })
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualiza la información de un usuario existente',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del usuario a actualizar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string', example: 'Juan Carlos Pérez' },
        email: { type: 'string', example: 'nuevo.email@ejemplo.com' },
        password: { type: 'string', example: 'nuevapassword123' },
        fecha_nacimiento: { type: 'string', example: '1990-05-15' },
        genero: { type: 'string', example: 'M' },
        altura: { type: 'number', example: 176 },
        telefono: { type: 'string', example: '+1234567899' },
        peso_actual: { type: 'number', example: 74 },
        objetivo_peso: { type: 'number', example: 72 },
        nivel_actividad: { type: 'string', example: 'muy_activo' },
        doctorId: {
          type: 'string',
          example: '323e4567-e89b-12d3-a456-426614174000',
          nullable: true,
        },
      },
    },
    examples: {
      json: {
        summary: 'Ejemplo JSON - Actualización completa',
        value: {
          nombre: 'Juan Carlos Pérez',
          email: 'nuevo.email@ejemplo.com',
          altura: 176,
          telefono: '+1234567899',
          peso_actual: 74,
          objetivo_peso: 72,
          nivel_actividad: 'muy_activo',
        },
      },
      xml: {
        summary: 'Ejemplo XML - Actualización parcial',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <nombre>Juan Carlos Pérez</nombre>
  <altura>176</altura>
  <peso_actual>74</peso_actual>
  <objetivo_peso>72</objetivo_peso>
</request>`,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está en uso por otro usuario',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido',
  })
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar usuario',
    description:
      'Elimina un usuario del sistema junto con su cuenta y datos relacionados',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del usuario a eliminar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
    schema: {
      example: {
        affected: 1,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido',
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get('health/check')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Health Check',
    description: 'Verifica el estado del microservicio de usuarios',
  })
  @ApiResponse({
    status: 200,
    description: 'Microservicio funcionando correctamente',
    schema: {
      example: {
        status: 'online',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 3600,
        service: 'Microservicio de usuario',
        version: '1.1.0',
      },
    },
  })
  healthCheck() {
    return this.userService.healthCheck();
  }
}
