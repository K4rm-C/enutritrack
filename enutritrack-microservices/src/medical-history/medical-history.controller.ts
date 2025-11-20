import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
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
import { MedicalHistoryService } from './medical-history.service';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';
import { UpdateMedicalHistoryDto } from './dto/update-medical-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Medical History')
@ApiBearerAuth()
@Controller('medical-history')
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Crear historial médico',
    description:
      'Crea un nuevo historial médico para un paciente. Solo disponible para doctores autenticados.',
  })
  @ApiBody({
    type: CreateMedicalHistoryDto,
    examples: {
      json: {
        summary: 'Ejemplo JSON - Historial completo',
        value: {
          pacienteId: '123e4567-e89b-12d3-a456-426614174000',
          condiciones: [
            {
              nombre: 'Diabetes Tipo 2',
              diagnostico_fecha: '2020-03-15',
              tratamiento: 'Metformina 500mg, dieta y ejercicio',
              notas: 'Bien controlada con medicación',
            },
            {
              nombre: 'Hipertensión Arterial',
              diagnostico_fecha: '2019-08-10',
              tratamiento: 'Losartán 50mg',
              notas: 'Controlada con medicación',
            },
          ],
          alergias: [
            {
              nombre: 'Penicilina',
              tipo: 'Medicamento',
              severidad: 'Alta',
              reaccion: 'Anafilaxia',
              notas: 'Reacción anafiláctica documentada en 2018',
            },
            {
              nombre: 'Mariscos',
              tipo: 'Alimento',
              severidad: 'Moderada',
              reaccion: 'Urticaria y edema',
              notas: 'Evitar consumo completo',
            },
          ],
          medicamentos: [
            {
              nombre: 'Metformina',
              dosis: '500mg',
              frecuencia: 'Cada 12 horas',
              proposito: 'Control de glucosa',
              notas: 'Tomar con alimentos',
            },
            {
              nombre: 'Losartán',
              dosis: '50mg',
              frecuencia: 'Una vez al día',
              proposito: 'Control de presión arterial',
              notas: 'Tomar en la mañana',
            },
          ],
        },
      },
      xml: {
        summary: 'Ejemplo XML - Historial básico',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<CreateMedicalHistoryDto>
  <pacienteId>123e4567-e89b-12d3-a456-426614174000</pacienteId>
  <condiciones>
    <condicion>
      <nombre>Asma</nombre>
      <diagnostico_fecha>2015-06-20</diagnostico_fecha>
      <tratamiento>Salbutamol inhalador según necesidad</tratamiento>
      <notas>Solo en episodios de ejercicio intenso</notas>
    </condicion>
  </condiciones>
  <alergias>
    <alergia>
      <nombre>Polen</nombre>
      <tipo>Ambiental</tipo>
      <severidad>Moderada</severidad>
      <reaccion>Rinitis alérgica</reaccion>
      <notas>Empeora en primavera</notas>
    </alergia>
  </alergias>
  <medicamentos>
    <medicamento>
      <nombre>Salbutamol</nombre>
      <dosis>100 mcg</dosis>
      <frecuencia>Según necesidad</frecuencia>
      <proposito>Alivio de síntomas de asma</proposito>
      <notas>Usar antes del ejercicio</notas>
    </medicamento>
  </medicamentos>
</CreateMedicalHistoryDto>`,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Historial médico creado exitosamente',
    schema: {
      example: {
        medicalHistories: [
          {
            id: '223e4567-e89b-12d3-a456-426614174000',
            usuarioId: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-15T10:30:00.000Z',
            updated_at: '2024-01-15T10:30:00.000Z',
          },
        ],
        condiciones: [
          {
            id: '323e4567-e89b-12d3-a456-426614174000',
            nombre: 'Diabetes Tipo 2',
            diagnostico_fecha: '2020-03-15T00:00:00.000Z',
            tratamiento: 'Metformina 500mg, dieta y ejercicio',
            notas: 'Bien controlada con medicación',
            usuarioId: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-15T10:30:00.000Z',
            updated_at: '2024-01-15T10:30:00.000Z',
          },
        ],
        alergias: [
          {
            id: '423e4567-e89b-12d3-a456-426614174000',
            nombre: 'Penicilina',
            tipo: 'Medicamento',
            severidad: 'Alta',
            reaccion: 'Anafilaxia',
            notas: 'Reacción anafiláctica documentada en 2018',
            usuarioId: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-15T10:30:00.000Z',
            updated_at: '2024-01-15T10:30:00.000Z',
          },
        ],
        medicamentos: [
          {
            id: '523e4567-e89b-12d3-a456-426614174000',
            nombre: 'Metformina',
            dosis: '500mg',
            frecuencia: 'Cada 12 horas',
            proposito: 'Control de glucosa',
            notas: 'Tomar con alimentos',
            usuarioId: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-15T10:30:00.000Z',
            updated_at: '2024-01-15T10:30:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente no encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido',
  })
  create(
    @Body() createMedicalHistoryDto: CreateMedicalHistoryDto,
    @Req() req: any,
  ) {
    // Obtener ID del doctor del token
    const doctorId = req.user?.userId || req.user?.sub;

    console.log(
      `Doctor ${doctorId} creando historial para paciente ${createMedicalHistoryDto.pacienteId}`,
    );

    return this.medicalHistoryService.create(createMedicalHistoryDto, doctorId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  @ApiOperation({
    summary: 'Obtener historial médico por usuario',
    description:
      'Retorna el historial médico completo de un usuario específico',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'ID del usuario/paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial médico obtenido exitosamente',
    schema: {
      example: {
        medicalHistories: [
          {
            id: '223e4567-e89b-12d3-a456-426614174000',
            usuarioId: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-15T10:30:00.000Z',
            updated_at: '2024-01-15T10:30:00.000Z',
          },
          {
            id: '623e4567-e89b-12d3-a456-426614174000',
            usuarioId: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2023-12-10T14:20:00.000Z',
            updated_at: '2023-12-10T14:20:00.000Z',
          },
        ],
        condiciones: [
          {
            id: '323e4567-e89b-12d3-a456-426614174000',
            nombre: 'Diabetes Tipo 2',
            diagnostico_fecha: '2020-03-15T00:00:00.000Z',
            tratamiento: 'Metformina 500mg, dieta y ejercicio',
            notas: 'Bien controlada con medicación',
            usuarioId: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-15T10:30:00.000Z',
            updated_at: '2024-01-15T10:30:00.000Z',
          },
          {
            id: '723e4567-e89b-12d3-a456-426614174000',
            nombre: 'Hipertensión Arterial',
            diagnostico_fecha: '2019-08-10T00:00:00.000Z',
            tratamiento: 'Losartán 50mg',
            notas: 'Controlada con medicación',
            usuarioId: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-15T10:30:00.000Z',
            updated_at: '2024-01-15T10:30:00.000Z',
          },
        ],
        alergias: [
          {
            id: '423e4567-e89b-12d3-a456-426614174000',
            nombre: 'Penicilina',
            tipo: 'Medicamento',
            severidad: 'Alta',
            reaccion: 'Anafilaxia',
            notas: 'Reacción anafiláctica documentada en 2018',
            usuarioId: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-15T10:30:00.000Z',
            updated_at: '2024-01-15T10:30:00.000Z',
          },
          {
            id: '823e4567-e89b-12d3-a456-426614174000',
            nombre: 'Mariscos',
            tipo: 'Alimento',
            severidad: 'Moderada',
            reaccion: 'Urticaria y edema',
            notas: 'Evitar consumo completo',
            usuarioId: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-15T10:30:00.000Z',
            updated_at: '2024-01-15T10:30:00.000Z',
          },
        ],
        medicamentos: [
          {
            id: '523e4567-e89b-12d3-a456-426614174000',
            nombre: 'Metformina',
            dosis: '500mg',
            frecuencia: 'Cada 12 horas',
            proposito: 'Control de glucosa',
            notas: 'Tomar con alimentos',
            usuarioId: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-15T10:30:00.000Z',
            updated_at: '2024-01-15T10:30:00.000Z',
          },
          {
            id: '923e4567-e89b-12d3-a456-426614174000',
            nombre: 'Losartán',
            dosis: '50mg',
            frecuencia: 'Una vez al día',
            proposito: 'Control de presión arterial',
            notas: 'Tomar en la mañana',
            usuarioId: '123e4567-e89b-12d3-a456-426614174000',
            created_at: '2024-01-15T10:30:00.000Z',
            updated_at: '2024-01-15T10:30:00.000Z',
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
  async findByUser(@Param('userId') userId: string) {
    try {
      const medicalHistory =
        await this.medicalHistoryService.findByUser(userId);
      return medicalHistory;
    } catch (error) {
      console.error('Error en controller:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  @ApiOperation({
    summary: 'Actualizar historial médico',
    description: 'Actualiza el historial médico de un usuario existente',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'ID del usuario/paciente a actualizar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateMedicalHistoryDto,
    examples: {
      json: {
        summary: 'Ejemplo JSON - Actualización parcial',
        value: {
          condiciones: [
            {
              nombre: 'Diabetes Tipo 2',
              diagnostico_fecha: '2020-03-15',
              tratamiento: 'Metformina 1000mg, dieta y ejercicio',
              notas: 'Aumento de dosis por control insuficiente',
            },
          ],
          alergias: [
            {
              nombre: 'Polvo doméstico',
              tipo: 'Ambiental',
              severidad: 'Leve',
              reaccion: 'Estornudos',
              notas: 'Solo en ambientes muy cargados',
            },
          ],
        },
      },
      xml: {
        summary: 'Ejemplo XML - Actualización de medicamentos',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<UpdateMedicalHistoryDto>
  <medicamentos>
    <medicamento>
      <nombre>Atorvastatina</nombre>
      <dosis>20mg</dosis>
      <frecuencia>Una vez al día</frecuencia>
      <proposito>Control de colesterol</proposito>
      <notas>Tomar en la noche</notas>
    </medicamento>
  </medicamentos>
</UpdateMedicalHistoryDto>`,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Historial médico actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido',
  })
  update(
    @Param('userId') userId: string,
    @Body() updateMedicalHistoryDto: UpdateMedicalHistoryDto,
  ) {
    return this.medicalHistoryService.update(userId, updateMedicalHistoryDto);
  }

  @Get('health/check')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Health Check',
    description: 'Verifica el estado del microservicio de historial médico',
  })
  @ApiResponse({
    status: 200,
    description: 'Microservicio funcionando correctamente',
    schema: {
      example: {
        status: 'online',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 3600,
        service: 'Microservicio de historial médico',
        version: '1.1.0',
      },
    },
  })
  healthCheck() {
    return this.medicalHistoryService.healthCheck();
  }
}
