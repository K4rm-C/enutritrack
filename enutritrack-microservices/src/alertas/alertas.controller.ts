import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AlertsService } from './alertas.service';
import {
  CreateAlertDto,
  UpdateAlertDto,
  CreateAlertActionDto,
  CreateAutomaticAlertConfigDto,
  UpdateAutomaticAlertConfigDto,
} from './dto/create-alert.dto';

@ApiTags('Alerts')
@ApiBearerAuth()
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nueva alerta',
    description: 'Crea una nueva alerta médica para un paciente',
  })
  @ApiBody({
    type: CreateAlertDto,
    examples: {
      json: {
        summary: 'Ejemplo JSON - Alerta de peso',
        value: {
          usuario_id: '123e4567-e89b-12d3-a456-426614174000',
          tipo_alerta_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          nivel_prioridad_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
          estado_alerta_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
          titulo: 'Aumento de peso significativo',
          descripcion: 'El paciente ha aumentado 5kg en la última semana',
          datos_referencia:
            '{"peso_anterior": 70, "peso_actual": 75, "diferencia": 5}',
          fecha_deteccion: '2024-01-15T10:30:00.000Z',
          fecha_resolucion: null,
          resuelta_por: null,
          notas_resolucion: null,
        },
      },
      xml: {
        summary: 'Ejemplo XML - Alerta de medicación',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<CreateAlertDto>
  <usuario_id>123e4567-e89b-12d3-a456-426614174000</usuario_id>
  <tipo_alerta_id>d4e5f6a7-b8c9-0123-defg-234567890123</tipo_alerta_id>
  <nivel_prioridad_id>e5f6a7b8-c9d0-1234-efgh-345678901234</nivel_prioridad_id>
  <estado_alerta_id>c3d4e5f6-a7b8-9012-cdef-123456789012</estado_alerta_id>
  <titulo>Recordatorio de medicación</titulo>
  <descripcion>Paciente no ha registrado toma de medicación en 24 horas</descripcion>
  <datos_referencia>{"medicamento": "Metformina", "ultima_toma": "2024-01-14T08:00:00.000Z"}</datos_referencia>
</CreateAlertDto>`,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Alerta creada exitosamente',
    schema: {
      example: {
        id: '223e4567-e89b-12d3-a456-426614174000',
        usuario_id: '123e4567-e89b-12d3-a456-426614174000',
        tipo_alerta_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        nivel_prioridad_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        estado_alerta_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
        titulo: 'Aumento de peso significativo',
        descripcion: 'El paciente ha aumentado 5kg en la última semana',
        datos_referencia:
          '{"peso_anterior": 70, "peso_actual": 75, "diferencia": 5}',
        fecha_deteccion: '2024-01-15T10:30:00.000Z',
        fecha_resolucion: null,
        resuelta_por: null,
        notas_resolucion: null,
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos de la alerta',
  })
  create(@Body() createDto: CreateAlertDto) {
    return this.alertsService.create(createDto);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener alertas por usuario',
    description: 'Retorna todas las alertas de un usuario específico',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'includeResolved',
    required: false,
    type: Boolean,
    description: 'Incluir alertas resueltas (por defecto: false)',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de alertas obtenida exitosamente',
    schema: {
      example: [
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          titulo: 'Aumento de peso significativo',
          descripcion: 'El paciente ha aumentado 5kg en la última semana',
          fecha_deteccion: '2024-01-15T10:30:00.000Z',
          fecha_resolucion: null,
          tipo_alerta: {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            nombre: 'Control de peso',
            categoria: { nombre: 'Biométricos' },
          },
          nivel_prioridad: {
            id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            nombre: 'Alta',
            nivel_numerico: 3,
          },
          estado_alerta: {
            id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
            nombre: 'Pendiente',
          },
          acciones: [
            {
              id: '323e4567-e89b-12d3-a456-426614174000',
              tipo_accion: 'Notificación',
              descripcion: 'Notificación enviada al doctor',
              fecha_accion: '2024-01-15T10:35:00.000Z',
            },
          ],
        },
      ],
    },
  })
  findByUser(
    @Param('userId') userId: string,
    @Query('includeResolved') includeResolved?: boolean,
  ) {
    return this.alertsService.findAllByUser(userId, includeResolved === true);
  }

  @Get('user/:userId/active')
  @ApiOperation({
    summary: 'Obtener alertas activas por usuario',
    description:
      'Retorna solo las alertas activas (no resueltas) de un usuario',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de alertas activas obtenida exitosamente',
  })
  findActiveByUser(@Param('userId') userId: string) {
    return this.alertsService.findActiveByUser(userId);
  }

  @Get('types')
  @ApiOperation({
    summary: 'Obtener tipos de alerta',
    description: 'Retorna todos los tipos de alerta disponibles en el sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de alerta obtenida exitosamente',
    schema: {
      example: [
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          nombre: 'Control de peso',
          descripcion:
            'Alertas relacionadas con cambios significativos de peso',
          categoria: {
            id: 'f6a7b8c9-d0e1-2345-fghi-456789012345',
            nombre: 'Biométricos',
          },
        },
        {
          id: 'd4e5f6a7-b8c9-0123-defg-234567890123',
          nombre: 'Recordatorio de medicación',
          descripcion: 'Alertas por omisión de medicación',
          categoria: {
            id: 'g7b8c9d0-e1f2-3456-ghij-567890123456',
            nombre: 'Medicación',
          },
        },
      ],
    },
  })
  getTypes() {
    return this.alertsService.getAlertTypes();
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Obtener categorías de alerta',
    description: 'Retorna todas las categorías de alerta disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías obtenida exitosamente',
    schema: {
      example: [
        {
          id: 'f6a7b8c9-d0e1-2345-fghi-456789012345',
          nombre: 'Biométricos',
          descripcion: 'Alertas basadas en mediciones biométricas',
        },
        {
          id: 'g7b8c9d0-e1f2-3456-ghij-567890123456',
          nombre: 'Medicación',
          descripcion: 'Alertas relacionadas con medicación y tratamientos',
        },
        {
          id: 'h8c9d0e1-f2g3-4567-hijk-678901234567',
          nombre: 'Actividad',
          descripcion: 'Alertas relacionadas con actividad física y ejercicio',
        },
      ],
    },
  })
  getCategories() {
    return this.alertsService.getAlertCategories();
  }

  @Get('priorities')
  @ApiOperation({
    summary: 'Obtener niveles de prioridad',
    description:
      'Retorna todos los niveles de prioridad disponibles para alertas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de niveles de prioridad obtenida exitosamente',
    schema: {
      example: [
        {
          id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
          nombre: 'Alta',
          nivel_numerico: 3,
          color: '#FF0000',
          descripcion: 'Requiere atención inmediata',
        },
        {
          id: 'i9d0e1f2-g3h4-5678-ijkl-789012345678',
          nombre: 'Media',
          nivel_numerico: 2,
          color: '#FFA500',
          descripcion: 'Requiere atención en las próximas horas',
        },
        {
          id: 'j0e1f2g3-h4i5-6789-jklm-890123456789',
          nombre: 'Baja',
          nivel_numerico: 1,
          color: '#FFFF00',
          descripcion: 'Requiere atención en las próximas 24 horas',
        },
      ],
    },
  })
  getPriorities() {
    return this.alertsService.getPriorityLevels();
  }

  @Get('states')
  @ApiOperation({
    summary: 'Obtener estados de alerta',
    description: 'Retorna todos los estados posibles para una alerta',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estados de alerta obtenida exitosamente',
    schema: {
      example: [
        {
          id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
          nombre: 'Pendiente',
          descripcion: 'Alerta detectada, pendiente de revisión',
        },
        {
          id: 'k1f2g3h4-i5j6-7890-klmn-901234567890',
          nombre: 'En Progreso',
          descripcion: 'Alerta siendo atendida',
        },
        {
          id: 'l2g3h4i5-j6k7-8901-lmno-012345678901',
          nombre: 'Resuelta',
          descripcion: 'Alerta resuelta y cerrada',
        },
      ],
    },
  })
  getStates() {
    return this.alertsService.getAlertStates();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener alerta por ID',
    description:
      'Retorna una alerta específica con toda su información y acciones',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la alerta',
    example: '223e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Alerta encontrada',
    schema: {
      example: {
        id: '223e4567-e89b-12d3-a456-426614174000',
        titulo: 'Aumento de peso significativo',
        descripcion: 'El paciente ha aumentado 5kg en la última semana',
        datos_referencia:
          '{"peso_anterior": 70, "peso_actual": 75, "diferencia": 5}',
        fecha_deteccion: '2024-01-15T10:30:00.000Z',
        fecha_resolucion: null,
        resuelta_por: null,
        notas_resolucion: null,
        tipo_alerta: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          nombre: 'Control de peso',
          categoria: { nombre: 'Biométricos' },
        },
        nivel_prioridad: {
          id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
          nombre: 'Alta',
          nivel_numerico: 3,
        },
        estado_alerta: {
          id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
          nombre: 'Pendiente',
        },
        acciones: [
          {
            id: '323e4567-e89b-12d3-a456-426614174000',
            tipo_accion: 'Notificación',
            descripcion: 'Notificación enviada al doctor',
            fecha_accion: '2024-01-15T10:35:00.000Z',
            metadata:
              '{"canal": "email", "destinatario": "doctor@clinica.com"}',
          },
        ],
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-15T10:35:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Alerta no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar alerta',
    description: 'Actualiza la información de una alerta existente',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la alerta a actualizar',
    example: '223e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateAlertDto })
  @ApiResponse({
    status: 200,
    description: 'Alerta actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Alerta no encontrada',
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateAlertDto) {
    return this.alertsService.update(id, updateDto);
  }

  @Put(':id/resolve')
  @ApiOperation({
    summary: 'Resolver alerta',
    description: 'Marca una alerta como resuelta por un doctor',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la alerta a resolver',
    example: '223e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        doctor_id: {
          type: 'string',
          example: '323e4567-e89b-12d3-a456-426614174000',
        },
        notas: {
          type: 'string',
          example: 'Paciente contactado, se ajustó medicación',
        },
      },
    },
    examples: {
      json: {
        summary: 'Ejemplo JSON - Resolver con notas',
        value: {
          doctor_id: '323e4567-e89b-12d3-a456-426614174000',
          notas: 'Paciente contactado, se ajustó medicación',
        },
      },
      xml: {
        summary: 'Ejemplo XML - Resolver sin notas',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <doctor_id>323e4567-e89b-12d3-a456-426614174000</doctor_id>
</request>`,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Alerta resuelta exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Alerta no encontrada o estado de resolución no disponible',
  })
  resolve(
    @Param('id') id: string,
    @Body('doctor_id') doctorId: string,
    @Body('notas') notas?: string,
  ) {
    return this.alertsService.resolveAlert(id, doctorId, notas);
  }

  @Post(':id/actions')
  @ApiOperation({
    summary: 'Agregar acción a alerta',
    description: 'Agrega una acción o seguimiento a una alerta existente',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la alerta',
    example: '223e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: CreateAlertActionDto,
    examples: {
      json: {
        summary: 'Ejemplo JSON - Notificación',
        value: {
          tipo_accion: 'Notificación',
          descripcion: 'Notificación enviada al paciente',
          metadata: '{"canal": "sms", "telefono": "+1234567890"}',
        },
      },
      xml: {
        summary: 'Ejemplo XML - Llamada',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<CreateAlertActionDto>
  <tipo_accion>Llamada</tipo_accion>
  <descripcion>Llamada realizada al paciente</descripcion>
  <metadata>{"duracion": "15 minutos", "resultado": "contactado"}</metadata>
</CreateAlertActionDto>`,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Acción agregada exitosamente',
    schema: {
      example: {
        id: '323e4567-e89b-12d3-a456-426614174000',
        alerta_id: '223e4567-e89b-12d3-a456-426614174000',
        tipo_accion: 'Notificación',
        descripcion: 'Notificación enviada al paciente',
        fecha_accion: '2024-01-15T10:35:00.000Z',
        metadata: '{"canal": "sms", "telefono": "+1234567890"}',
        created_at: '2024-01-15T10:35:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Alerta no encontrada',
  })
  addAction(
    @Param('id') id: string,
    @Body() createActionDto: CreateAlertActionDto,
  ) {
    return this.alertsService.addAction(id, createActionDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar alerta',
    description: 'Elimina una alerta del sistema',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la alerta a eliminar',
    example: '223e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Alerta eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Alerta no encontrada',
  })
  delete(@Param('id') id: string) {
    return this.alertsService.delete(id);
  }

  @Post('automatic-configs')
  @ApiOperation({
    summary: 'Crear configuración automática',
    description:
      'Crea una configuración para generar alertas automáticamente basada en condiciones específicas',
  })
  @ApiBody({
    type: CreateAutomaticAlertConfigDto,
    examples: {
      json: {
        summary: 'Ejemplo JSON - Configuración de peso',
        value: {
          usuario_id: '123e4567-e89b-12d3-a456-426614174000',
          tipo_alerta_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          nombre: 'Control de cambio de peso',
          descripcion: 'Alerta por cambios de peso mayores a 2kg en una semana',
          condicion:
            '{"tipo": "peso", "operador": ">", "valor": 2, "periodo": "7d"}',
          activa: true,
        },
      },
      xml: {
        summary: 'Ejemplo XML - Configuración de medicación',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<CreateAutomaticAlertConfigDto>
  <usuario_id>123e4567-e89b-12d3-a456-426614174000</usuario_id>
  <tipo_alerta_id>d4e5f6a7-b8c9-0123-defg-234567890123</tipo_alerta_id>
  <nombre>Recordatorio medicación</nombre>
  <descripcion>Alerta por omisión de medicación por más de 24 horas</descripcion>
  <condicion>{"tipo": "medicacion", "operador": ">", "valor": 24, "unidad": "horas"}</condicion>
  <activa>true</activa>
</CreateAutomaticAlertConfigDto>`,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Configuración automática creada exitosamente',
  })
  createAutomaticConfig(@Body() createDto: CreateAutomaticAlertConfigDto) {
    return this.alertsService.createAutomaticConfig(createDto);
  }

  @Get('automatic-configs/user/:userId')
  @ApiOperation({
    summary: 'Obtener configuraciones automáticas por usuario',
    description:
      'Retorna todas las configuraciones automáticas de alertas para un usuario',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de configuraciones automáticas obtenida exitosamente',
    schema: {
      example: [
        {
          id: '423e4567-e89b-12d3-a456-426614174000',
          nombre: 'Control de cambio de peso',
          descripcion: 'Alerta por cambios de peso mayores a 2kg en una semana',
          condicion:
            '{"tipo": "peso", "operador": ">", "valor": 2, "periodo": "7d"}',
          activa: true,
          tipo_alerta: {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            nombre: 'Control de peso',
          },
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T10:30:00.000Z',
        },
      ],
    },
  })
  getAutomaticConfigsByUser(@Param('userId') userId: string) {
    return this.alertsService.getAutomaticConfigsByUser(userId);
  }

  @Put('automatic-configs/:id')
  @ApiOperation({
    summary: 'Actualizar configuración automática',
    description: 'Actualiza una configuración automática de alertas existente',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la configuración automática',
    example: '423e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateAutomaticAlertConfigDto })
  @ApiResponse({
    status: 200,
    description: 'Configuración automática actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración automática no encontrada',
  })
  updateAutomaticConfig(
    @Param('id') id: string,
    @Body() updateDto: UpdateAutomaticAlertConfigDto,
  ) {
    return this.alertsService.updateAutomaticConfig(id, updateDto);
  }

  @Delete('automatic-configs/:id')
  @ApiOperation({
    summary: 'Eliminar configuración automática',
    description: 'Elimina una configuración automática de alertas',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la configuración automática a eliminar',
    example: '423e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración automática eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración automática no encontrada',
  })
  deleteAutomaticConfig(@Param('id') id: string) {
    return this.alertsService.deleteAutomaticConfig(id);
  }

  @Get('health/check')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Health Check',
    description: 'Verifica el estado del microservicio de alertas',
  })
  @ApiResponse({
    status: 200,
    description: 'Microservicio funcionando correctamente',
    schema: {
      example: {
        status: 'online',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 3600,
        service: 'Microservicio de alertas',
        version: '1.1.0',
      },
    },
  })
  healthCheck() {
    return this.alertsService.healthCheck();
  }
}
