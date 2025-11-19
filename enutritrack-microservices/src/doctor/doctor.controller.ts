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
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar nuevo doctor',
    description:
      'Endpoint público para registrar un nuevo doctor en el sistema',
  })
  @ApiBody({
    type: CreateDoctorDto,
    examples: {
      json: {
        summary: 'Ejemplo JSON - Registro completo',
        value: {
          nombre: 'Dr. Carlos López',
          email: 'carlos.lopez@clinica.com',
          password: 'password123',
          especialidad_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          cedula: '1234567',
          telefono: '+1234567890',
        },
      },
      xml: {
        summary: 'Ejemplo XML - Registro básico',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<CreateDoctorDto>
  <nombre>Dra. María García</nombre>
  <email>maria.garcia@clinica.com</email>
  <password>password123</password>
  <especialidad_id>b2c3d4e5-f6a7-8901-bcde-f12345678901</especialidad_id>
  <cedula>7654321</cedula>
  <telefono>+1234567891</telefono>
</CreateDoctorDto>`,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Doctor creado exitosamente',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Dr. Carlos López',
        cedula_profesional: '1234567',
        telefono: '+1234567890',
        especialidad: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          nombre: 'Cardiología',
        },
        cuenta: {
          id: '223e4567-e89b-12d3-a456-426614174000',
          email: 'carlos.lopez@clinica.com',
          tipo_cuenta: 'DOCTOR',
          activa: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está registrado',
  })
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create(createDoctorDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener todos los doctores',
    description:
      'Retorna una lista de todos los doctores registrados en el sistema. Requiere autenticación JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de doctores obtenida exitosamente',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nombre: 'Dr. Carlos López',
          cedula_profesional: '1234567',
          telefono: '+1234567890',
          especialidad: {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            nombre: 'Cardiología',
          },
          cuenta: {
            email: 'carlos.lopez@clinica.com',
            activa: true,
          },
        },
        {
          id: '323e4567-e89b-12d3-a456-426614174000',
          nombre: 'Dra. María García',
          cedula_profesional: '7654321',
          telefono: '+1234567891',
          especialidad: {
            id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            nombre: 'Pediatría',
          },
          cuenta: {
            email: 'maria.garcia@clinica.com',
            activa: true,
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
    return this.doctorService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener doctor por ID',
    description: 'Retorna la información completa de un doctor específico',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del doctor',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor encontrado',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Dr. Carlos López',
        cedula_profesional: '1234567',
        telefono: '+1234567890',
        especialidad_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        cuenta_id: '223e4567-e89b-12d3-a456-426614174000',
        especialidad: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          nombre: 'Cardiología',
          descripcion: 'Especialidad en enfermedades del corazón',
        },
        cuenta: {
          id: '223e4567-e89b-12d3-a456-426614174000',
          email: 'carlos.lopez@clinica.com',
          tipo_cuenta: 'DOCTOR',
          activa: true,
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T10:30:00.000Z',
        },
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor no encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido',
  })
  findOne(@Param('id') id: string) {
    return this.doctorService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('email/:email')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar doctor por email',
    description: 'Retorna un doctor específico basado en su dirección de email',
  })
  @ApiParam({
    name: 'email',
    type: String,
    description: 'Email del doctor',
    example: 'doctor@clinica.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor encontrado',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Dr. Carlos López',
        cedula_profesional: '1234567',
        telefono: '+1234567890',
        especialidad: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          nombre: 'Cardiología',
        },
        cuenta: {
          email: 'carlos.lopez@clinica.com',
          activa: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor no encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido',
  })
  findByEmail(@Param('email') email: string) {
    return this.doctorService.findByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar doctor',
    description: 'Actualiza la información de un doctor existente',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del doctor a actualizar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string', example: 'Dr. Carlos Eduardo López' },
        email: { type: 'string', example: 'nuevo.email@clinica.com' },
        password: { type: 'string', example: 'nuevapassword123' },
        especialidad_id: {
          type: 'string',
          example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        },
        cedula_profesional: { type: 'string', example: '1234567-A' },
        telefono: { type: 'string', example: '+1234567899' },
      },
    },
    examples: {
      json: {
        summary: 'Ejemplo JSON - Actualización completa',
        value: {
          nombre: 'Dr. Carlos Eduardo López',
          email: 'nuevo.email@clinica.com',
          especialidad_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
          cedula_profesional: '1234567-A',
          telefono: '+1234567899',
        },
      },
      xml: {
        summary: 'Ejemplo XML - Actualización parcial',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <nombre>Dr. Carlos Eduardo López</nombre>
  <telefono>+1234567899</telefono>
  <cedula_profesional>1234567-A</cedula_profesional>
</request>`,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está en uso por otro doctor',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido',
  })
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.doctorService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar doctor',
    description: 'Elimina un doctor del sistema junto con su cuenta',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del doctor a eliminar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor eliminado exitosamente',
    schema: {
      example: {
        affected: 1,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor no encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido',
  })
  remove(@Param('id') id: string) {
    return this.doctorService.remove(id);
  }

  @Get('health/check')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Health Check',
    description: 'Verifica el estado del microservicio de doctores',
  })
  @ApiResponse({
    status: 200,
    description: 'Microservicio funcionando correctamente',
    schema: {
      example: {
        status: 'online',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 3600,
        service: 'Microservicio de doctor',
        version: '1.1.0',
      },
    },
  })
  healthCheck() {
    return this.doctorService.healthCheck();
  }
}
