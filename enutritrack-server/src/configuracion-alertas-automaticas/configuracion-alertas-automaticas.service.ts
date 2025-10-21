import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracionAlertasAutomaticas } from './models/configuracion-alertas-automaticas.model';
import { CreateConfiguracionAlertasAutomaticasDto } from './dto/create-configuracion-alertas-automaticas.dto';
import { UpdateConfiguracionAlertasAutomaticasDto } from './dto/update-configuracion-alertas-automaticas.dto';

@Injectable()
export class ConfiguracionAlertasAutomaticasService {
  constructor(
    @InjectRepository(ConfiguracionAlertasAutomaticas)
    private configuracionAlertaRepository: Repository<ConfiguracionAlertasAutomaticas>,
  ) {}

  async create(createConfiguracionDto: CreateConfiguracionAlertasAutomaticasDto): Promise<ConfiguracionAlertasAutomaticas> {
    // Verificar que no exista ya una configuración para este usuario y tipo de alerta
    const existingConfig = await this.configuracionAlertaRepository.findOne({
      where: {
        usuario_id: createConfiguracionDto.usuario_id,
        tipo_alerta_id: createConfiguracionDto.tipo_alerta_id
      }
    });

    if (existingConfig) {
      throw new ConflictException('Ya existe una configuración para este usuario y tipo de alerta');
    }

    const configuracion = this.configuracionAlertaRepository.create(createConfiguracionDto);
    return await this.configuracionAlertaRepository.save(configuracion);
  }

  async findAll(): Promise<ConfiguracionAlertasAutomaticas[]> {
    return await this.configuracionAlertaRepository.find({
      relations: ['usuario', 'doctor', 'tipo_alerta', 'tipo_alerta.categoria'],
      order: { created_at: 'DESC' }
    });
  }

  async findByUser(userId: string): Promise<ConfiguracionAlertasAutomaticas[]> {
    return await this.configuracionAlertaRepository.find({
      where: { usuario_id: userId },
      relations: ['usuario', 'doctor', 'tipo_alerta', 'tipo_alerta.categoria'],
      order: { created_at: 'DESC' }
    });
  }

  async findByActive(): Promise<ConfiguracionAlertasAutomaticas[]> {
    return await this.configuracionAlertaRepository.find({
      where: { esta_activa: true },
      relations: ['usuario', 'doctor', 'tipo_alerta', 'tipo_alerta.categoria'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: string): Promise<ConfiguracionAlertasAutomaticas | null> {
    return await this.configuracionAlertaRepository.findOne({ 
      where: { id },
      relations: ['usuario', 'doctor', 'tipo_alerta', 'tipo_alerta.categoria']
    });
  }

  async findByUserAndTipoAlerta(userId: string, tipoAlertaId: string): Promise<ConfiguracionAlertasAutomaticas | null> {
    return await this.configuracionAlertaRepository.findOne({
      where: { 
        usuario_id: userId,
        tipo_alerta_id: tipoAlertaId
      },
      relations: ['usuario', 'doctor', 'tipo_alerta', 'tipo_alerta.categoria']
    });
  }

  async update(id: string, updateConfiguracionDto: UpdateConfiguracionAlertasAutomaticasDto): Promise<ConfiguracionAlertasAutomaticas | null> {
    const result = await this.configuracionAlertaRepository.update(id, updateConfiguracionDto);
    if (result.affected === 0) {
      throw new NotFoundException('Configuración de alertas automáticas no encontrada');
    }
    return await this.findOne(id);
  }

  async toggleActive(id: string): Promise<ConfiguracionAlertasAutomaticas | null> {
    const configuracion = await this.findOne(id);
    if (!configuracion) {
      throw new NotFoundException('Configuración de alertas automáticas no encontrada');
    }

    await this.configuracionAlertaRepository.update(id, { 
      esta_activa: !configuracion.esta_activa 
    });
    
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.configuracionAlertaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Configuración de alertas automáticas no encontrada');
    }
  }
}
