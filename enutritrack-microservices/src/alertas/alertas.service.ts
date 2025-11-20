import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Alert } from './models/alertas.model';
import { AlertType } from './models/tipos_alerta.model';
import { AlertCategory } from './models/categorias_alerta.model';
import { AlertPriority } from './models/niveles_prioridad_alerta.model';
import { AlertState } from './models/estados_alerta.model';
import { AlertAction } from './models/alertas_acciones.model';
import { AutomaticAlertConfig } from './models/configuracion_alertas_automaticas.model';

import {
  CreateAlertDto,
  UpdateAlertDto,
  CreateAlertActionDto,
  CreateAutomaticAlertConfigDto,
  UpdateAutomaticAlertConfigDto,
} from './dto/create-alert.dto';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectRepository(AlertType)
    private alertTypeRepository: Repository<AlertType>,
    @InjectRepository(AlertCategory)
    private alertCategoryRepository: Repository<AlertCategory>,
    @InjectRepository(AlertPriority)
    private alertPriorityRepository: Repository<AlertPriority>,
    @InjectRepository(AlertState)
    private alertStateRepository: Repository<AlertState>,
    @InjectRepository(AlertAction)
    private alertActionRepository: Repository<AlertAction>,
    @InjectRepository(AutomaticAlertConfig)
    private automaticConfigRepository: Repository<AutomaticAlertConfig>,
  ) {}

  async create(createDto: CreateAlertDto): Promise<Alert> {
    try {
      const alert = this.alertRepository.create({
        ...createDto,
        fecha_deteccion: createDto.fecha_deteccion || new Date(),
      });
      return await this.alertRepository.save(alert);
    } catch (error) {
      this.logger.error(`Error creating alert: ${error.message}`);
      throw new BadRequestException('Error al crear la alerta');
    }
  }

  async findAllByUser(
    userId: string,
    includeResolved: boolean = false,
  ): Promise<Alert[]> {
    const where: any = { usuario_id: userId };
    if (!includeResolved) {
      where.fecha_resolucion = null;
    }

    return this.alertRepository.find({
      where,
      relations: [
        'tipo_alerta',
        'nivel_prioridad',
        'estado_alerta',
        'acciones',
      ],
      order: { fecha_deteccion: 'DESC' },
    });
  }

  async findActiveByUser(userId: string): Promise<Alert[]> {
    return this.alertRepository.find({
      where: { usuario_id: userId, fecha_resolucion: IsNull() },
      relations: ['tipo_alerta', 'nivel_prioridad', 'estado_alerta'],
      order: { fecha_deteccion: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { id },
      relations: [
        'tipo_alerta',
        'nivel_prioridad',
        'estado_alerta',
        'acciones',
      ],
    });

    if (!alert) {
      throw new NotFoundException('Alerta no encontrada');
    }

    return alert;
  }

  async update(id: string, updateDto: UpdateAlertDto): Promise<Alert> {
    const alert = await this.findOne(id);
    Object.assign(alert, updateDto);
    return this.alertRepository.save(alert);
  }

  async resolveAlert(
    id: string,
    doctorId: string,
    notas?: string,
  ): Promise<Alert> {
    const alert = await this.findOne(id);
    const resolvedState = await this.alertStateRepository.findOne({
      where: { nombre: 'Resuelta' },
    });

    if (!resolvedState) {
      throw new NotFoundException('Estado de alerta "Resuelta" no encontrado');
    }

    alert.fecha_resolucion = new Date();
    alert.resuelta_por = doctorId;
    alert.estado_alerta_id = resolvedState.id;

    if (notas) {
      alert.notas_resolucion = notas;
    }

    return this.alertRepository.save(alert);
  }

  async addAction(
    id: string,
    createActionDto: CreateAlertActionDto,
  ): Promise<AlertAction> {
    const alert = await this.findOne(id);

    const action = this.alertActionRepository.create({
      alerta_id: id,
      ...createActionDto,
      fecha_accion: new Date(),
    });

    const savedAction = await this.alertActionRepository.save(action);

    if (!alert.fecha_resolucion) {
      const enProgresoState = await this.alertStateRepository.findOne({
        where: { nombre: 'En Progreso' },
      });
      if (enProgresoState) {
        alert.estado_alerta_id = enProgresoState.id;
        await this.alertRepository.save(alert);
      }
    }

    return savedAction;
  }

  async delete(id: string): Promise<void> {
    const result = await this.alertRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Alerta no encontrada');
    }
  }

  async getAlertTypes(): Promise<AlertType[]> {
    return this.alertTypeRepository.find({
      relations: ['categoria'],
      order: { nombre: 'ASC' },
    });
  }

  async getAlertCategories(): Promise<AlertCategory[]> {
    return this.alertCategoryRepository.find({ order: { nombre: 'ASC' } });
  }

  async getPriorityLevels(): Promise<AlertPriority[]> {
    return this.alertPriorityRepository.find({
      order: { nivel_numerico: 'DESC' },
    });
  }

  async getAlertStates(): Promise<AlertState[]> {
    return this.alertStateRepository.find({ order: { nombre: 'ASC' } });
  }

  async createAutomaticConfig(
    createDto: CreateAutomaticAlertConfigDto,
  ): Promise<AutomaticAlertConfig> {
    try {
      const config = this.automaticConfigRepository.create(createDto);
      return await this.automaticConfigRepository.save(config);
    } catch (error) {
      throw new BadRequestException(
        'Error al crear la configuración automática',
      );
    }
  }

  async getAutomaticConfigsByUser(
    userId: string,
  ): Promise<AutomaticAlertConfig[]> {
    return this.automaticConfigRepository.find({
      where: { usuario_id: userId },
      relations: ['tipo_alerta'],
      order: { created_at: 'DESC' },
    });
  }

  async updateAutomaticConfig(
    id: string,
    updateDto: UpdateAutomaticAlertConfigDto,
  ): Promise<AutomaticAlertConfig> {
    const config = await this.automaticConfigRepository.findOne({
      where: { id },
    });
    if (!config) {
      throw new NotFoundException('Configuración automática no encontrada');
    }
    Object.assign(config, updateDto);
    return this.automaticConfigRepository.save(config);
  }

  async deleteAutomaticConfig(id: string): Promise<void> {
    const result = await this.automaticConfigRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Configuración automática no encontrada');
    }
  }

  async healthCheck() {
    const startTime = Date.now();

    const uptime = Math.floor((Date.now() - startTime) / 1000);

    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      service: process.env.SERVICE_NAME || 'Microservicio de alertas',
      version: process.env.APP_VERSION || '1.1.0',
    };
  }
}
