import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ActivityType } from './tipos_actividad.model';

@Entity('actividad_fisica')
export class PhysicalActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @Column({ name: 'tipo_actividad_id' })
  tipo_actividad_id: string;

  @ManyToOne(() => ActivityType)
  @JoinColumn({ name: 'tipo_actividad_id' })
  tipo_actividad: ActivityType;

  @Column({ type: 'int', name: 'duracion_min' })
  duracion_min: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    name: 'calorias_quemadas',
  })
  calorias_quemadas: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  intensidad: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
