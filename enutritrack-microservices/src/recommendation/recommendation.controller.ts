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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';
import { RecommendationsService } from './recommendation.service';
import {
  CreateRecommendationDto,
  CreateAIRecommendationDto,
  UpdateRecommendationDto,
  CreateRecommendationTypeDto,
  UpdateRecommendationTypeDto,
} from './dto/create-recommendation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Recommendations')
@ApiProduces('application/json', 'application/xml')
@ApiConsumes('application/json', 'application/xml')
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  // ========== ENDPOINTS PARA TIPOS DE RECOMENDACIÓN ==========

  @UseGuards(JwtAuthGuard)
  @Post('types')
  @ApiOperation({
    summary: 'Crear tipo de recomendación',
    description: 'Crea un nuevo tipo de recomendación en el sistema',
  })
  @ApiBody({
    type: CreateRecommendationTypeDto,
    examples: {
      json: {
        summary: 'Ejemplo JSON',
        value: {
          nombre: 'Nutrición',
          descripcion: 'Recomendaciones relacionadas con alimentación y dieta',
        },
      },
      xml: {
        summary: 'Ejemplo XML',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<CreateRecommendationTypeDto>
  <nombre>Nutrición</nombre>
  <descripcion>Recomendaciones relacionadas con alimentación y dieta</descripcion>
</CreateRecommendationTypeDto>`,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tipo de recomendación creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  createType(@Body() createTypeDto: CreateRecommendationTypeDto) {
    return this.recommendationsService.createType(createTypeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('types')
  @ApiOperation({
    summary: 'Obtener todos los tipos de recomendación',
    description:
      'Retorna una lista de todos los tipos de recomendación disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de recomendación obtenida exitosamente',
  })
  getTypes() {
    return this.recommendationsService.findAllTypes();
  }

  @UseGuards(JwtAuthGuard)
  @Get('types/:id')
  @ApiOperation({
    summary: 'Obtener tipo de recomendación por ID',
    description: 'Retorna un tipo de recomendación específico basado en su ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del tipo de recomendación',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo de recomendación encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de recomendación no encontrado',
  })
  getTypeById(@Param('id') id: string) {
    return this.recommendationsService.findTypeById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('types/:id')
  @ApiOperation({
    summary: 'Actualizar tipo de recomendación',
    description: 'Actualiza un tipo de recomendación existente',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del tipo de recomendación a actualizar',
  })
  @ApiBody({ type: UpdateRecommendationTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Tipo de recomendación actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de recomendación no encontrado',
  })
  updateType(
    @Param('id') id: string,
    @Body() updateTypeDto: UpdateRecommendationTypeDto,
  ) {
    return this.recommendationsService.updateType(id, updateTypeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('types/:id')
  @ApiOperation({
    summary: 'Eliminar tipo de recomendación',
    description: 'Elimina un tipo de recomendación del sistema',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del tipo de recomendación a eliminar',
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo de recomendación eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de recomendación no encontrado',
  })
  deleteType(@Param('id') id: string) {
    return this.recommendationsService.deleteType(id);
  }

  // ========== ENDPOINTS PARA RECOMENDACIONES ==========
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Crear recomendación manual',
    description: 'Crea una nueva recomendación de forma manual',
  })
  @ApiBody({
    type: CreateRecommendationDto,
    examples: {
      json: {
        summary: 'Ejemplo JSON',
        value: {
          usuario_id: '123e4567-e89b-12d3-a456-426614174000',
          tipo_recomendacion_id: '123e4567-e89b-12d3-a456-426614174001',
          contenido: 'Realizar 30 minutos de ejercicio cardiovascular diario',
          prioridad: 'alta',
          vigencia_hasta: '2024-12-31T23:59:59.999Z',
          activa: true,
        },
      },
      xml: {
        summary: 'Ejemplo XML',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<CreateRecommendationDto>
  <usuario_id>123e4567-e89b-12d3-a456-426614174000</usuario_id>
  <tipo_recomendacion_id>123e4567-e89b-12d3-a456-426614174001</tipo_recomendacion_id>
  <contenido>Realizar 30 minutos de ejercicio cardiovascular diario</contenido>
  <prioridad>alta</prioridad>
  <vigencia_hasta>2024-12-31T23:59:59.999Z</vigencia_hasta>
  <activa>true</activa>
</CreateRecommendationDto>`,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Recomendación creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  create(@Body() createDto: CreateRecommendationDto) {
    return this.recommendationsService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('ai')
  @ApiOperation({
    summary: 'Crear recomendación con IA',
    description:
      'Crea una nueva recomendación utilizando inteligencia artificial',
  })
  @ApiBody({
    type: CreateAIRecommendationDto,
    examples: {
      json: {
        summary: 'Ejemplo JSON',
        value: {
          usuario_id: '123e4567-e89b-12d3-a456-426614174000',
          tipo_recomendacion_id: '123e4567-e89b-12d3-a456-426614174001',
          contexto_adicional: 'Paciente con diabetes tipo 2',
          prioridad: 'media',
          vigencia_hasta: '2024-12-31T23:59:59.999Z',
        },
      },
      xml: {
        summary: 'Ejemplo XML',
        value: `<?xml version="1.0" encoding="UTF-8"?>
<CreateAIRecommendationDto>
  <usuario_id>123e4567-e89b-12d3-a456-426614174000</usuario_id>
  <tipo_recomendacion_id>123e4567-e89b-12d3-a456-426614174001</tipo_recomendacion_id>
  <contexto_adicional>Paciente con diabetes tipo 2</contexto_adicional>
  <prioridad>media</prioridad>
  <vigencia_hasta>2024-12-31T23:59:59.999Z</vigencia_hasta>
</CreateAIRecommendationDto>`,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Recomendación con IA creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  @ApiResponse({
    status: 404,
    description: 'Tipo de recomendación no encontrado',
  })
  createWithAI(@Body() createAIDto: CreateAIRecommendationDto) {
    return this.recommendationsService.createWithAI(createAIDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener recomendaciones por usuario',
    description: 'Retorna todas las recomendaciones de un usuario específico',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'includeInactive',
    type: Boolean,
    required: false,
    description: 'Incluir recomendaciones inactivas',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de recomendaciones obtenida exitosamente',
  })
  findByUser(
    @Param('userId') userId: string,
    @Query('includeInactive') includeInactive?: boolean,
  ) {
    return this.recommendationsService.findAllByUser(
      userId,
      includeInactive === true,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId/active')
  @ApiOperation({
    summary: 'Obtener recomendaciones activas por usuario',
    description:
      'Retorna solo las recomendaciones activas de un usuario específico',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'ID del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de recomendaciones activas obtenida exitosamente',
  })
  findActiveByUser(@Param('userId') userId: string) {
    return this.recommendationsService.findActiveByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener recomendación por ID',
    description: 'Retorna una recomendación específica basada en su ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la recomendación',
  })
  @ApiResponse({
    status: 200,
    description: 'Recomendación encontrada',
  })
  @ApiResponse({ status: 404, description: 'Recomendación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.recommendationsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar recomendación',
    description: 'Actualiza una recomendación existente',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la recomendación a actualizar',
  })
  @ApiBody({ type: UpdateRecommendationDto })
  @ApiResponse({
    status: 200,
    description: 'Recomendación actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Recomendación no encontrada' })
  update(@Param('id') id: string, @Body() updateDto: UpdateRecommendationDto) {
    return this.recommendationsService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/deactivate')
  @ApiOperation({
    summary: 'Desactivar recomendación',
    description: 'Desactiva una recomendación específica',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la recomendación a desactivar',
  })
  @ApiResponse({
    status: 200,
    description: 'Recomendación desactivada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Recomendación no encontrada' })
  deactivate(@Param('id') id: string) {
    return this.recommendationsService.deactivate(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar recomendación',
    description: 'Elimina una recomendación del sistema',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la recomendación a eliminar',
  })
  @ApiResponse({
    status: 200,
    description: 'Recomendación eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Recomendación no encontrada' })
  delete(@Param('id') id: string) {
    return this.recommendationsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/data')
  @ApiOperation({
    summary: 'Agregar datos a recomendación',
    description: 'Agrega datos adicionales a una recomendación específica',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la recomendación',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['clave', 'valor'],
      properties: {
        clave: { type: 'string', example: 'frecuencia' },
        valor: { type: 'string', example: 'diaria' },
        tipo_dato: { type: 'string', example: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Datos agregados exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Recomendación no encontrada' })
  addData(
    @Param('id') id: string,
    @Body('clave') clave: string,
    @Body('valor') valor: string,
    @Body('tipo_dato') tipo_dato?: string,
  ) {
    return this.recommendationsService.addRecommendationData(
      id,
      clave,
      valor,
      tipo_dato,
    );
  }

  @Get('health/check')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Health Check',
    description: 'Verifica el estado del microservicio de recomendaciones',
  })
  @ApiResponse({
    status: 200,
    description: 'Microservicio funcionando correctamente',
    schema: {
      example: {
        status: 'online',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 3600,
        service: 'Microservicio de recomendaciones',
        version: '1.1.0',
      },
    },
  })
  healthCheck() {
    return this.recommendationsService.healthCheck();
  }
}
