// shared/entities/TipoActividad.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ActividadFisica } from './ActividadFisica';

@Entity('tipos_actividad')
export class TipoActividad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'met_value' })
  metValue!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categoria?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @OneToMany(() => ActividadFisica, actividad => actividad.tipoActividad)
  actividades?: ActividadFisica[];
}