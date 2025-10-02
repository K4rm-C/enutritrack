// src/physical-activity/physical-activity.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { PhysicalActivity } from './models/activity.model';
import { CreatePhysicalActivityDto } from './dto/create-physical-activity.dto';
import { UpdatePhysicalActivityDto } from './dto/update-physical-activity.dto';

@Injectable()
export class PhysicalActivityService {
  constructor(
    @InjectConnection()
    private connection: Connection,
  ) {}

  async create(
    createPhysicalActivityDto: CreatePhysicalActivityDto,
  ): Promise<void> {
    const { usuarioId, tipo_actividad, duracion, caloriasQuemadas, fecha } = createPhysicalActivityDto;
    
    await this.connection.query(
      'CALL create_physical_activity($1, $2, $3, $4, $5)',
      [usuarioId, tipo_actividad, duracion, caloriasQuemadas, fecha]
    );
  }

  async findAllByUser(userId: string): Promise<PhysicalActivity[]> {
    const result = await this.connection.query(
      'SELECT * FROM get_activities_by_user($1)',
      [userId]
    );
    
    return result.map(row => ({
      id: row.id,
      usuario: { id: row.usuario_id } as any,
      tipo_actividad: row.tipo_actividad,
      duracion: row.duracion_min,
      caloriasQuemadas: parseFloat(row.calorias_quemadas),
      fecha: row.fecha,
      created_at: row.created_at
    }));
  }

  async findOne(id: string): Promise<PhysicalActivity> {
    try {
      const result = await this.connection.query(
        'SELECT * FROM get_activity_by_id($1)',
        [id]
      );
      
      if (result.length === 0) {
        throw new NotFoundException('Actividad física no encontrada');
      }
      
      const row = result[0];
      return {
        id: row.id,
        usuario: { id: row.usuario_id } as any,
        tipo_actividad: row.tipo_actividad,
        duracion: row.duracion_min,
        caloriasQuemadas: parseFloat(row.calorias_quemadas),
        fecha: row.fecha,
        created_at: row.created_at
      };
    } catch (error) {
      if (error.message.includes('no encontrada')) {
        throw new NotFoundException('Actividad física no encontrada');
      }
      throw error;
    }
  }

  async update(
    id: string,
    updatePhysicalActivityDto: UpdatePhysicalActivityDto,
  ): Promise<void> {
    const { usuarioId, tipo_actividad, duracion, caloriasQuemadas, fecha } = updatePhysicalActivityDto;
    
    try {
      await this.connection.query(
        'CALL update_physical_activity($1, $2, $3, $4, $5, $6)',
        [id, usuarioId, tipo_actividad, duracion, caloriasQuemadas, fecha]
      );
    } catch (error) {
      if (error.message.includes('no encontrada')) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.connection.query(
        'CALL delete_physical_activity($1)',
        [id]
      );
    } catch (error) {
      if (error.message.includes('no encontrada')) {
        throw new NotFoundException('Actividad física no encontrada');
      }
      throw error;
    }
  }

  async getWeeklySummary(userId: string, startDate: Date): Promise<any> {
    const result = await this.connection.query(
      'SELECT * FROM get_weekly_summary($1, $2)',
      [userId, startDate]
    );
    
    if (result.length > 0) {
      const row = result[0];
      return {
        totalMinutos: parseInt(row.total_minutos),
        totalCaloriasQuemadas: parseFloat(row.total_calorias_quemadas),
        actividadesPorTipo: row.actividades_por_tipo
      };
    }
    
    return {
      totalMinutos: 0,
      totalCaloriasQuemadas: 0,
      actividadesPorTipo: {}
    };
  }
}