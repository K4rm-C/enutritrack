import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { AlertType } from './tipos_alerta.model';
import { AlertPriority } from './niveles_prioridad_alerta.model';
import { AlertState } from './estados_alerta.model';
import { AlertAction } from './alertas_acciones.model';

@Entity('alertas')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @Column({ name: 'doctor_id', nullable: true })
  doctor_id: string;

  @Column({ name: 'tipo_alerta_id' })
  tipo_alerta_id: string;

  @ManyToOne(() => AlertType)
  @JoinColumn({ name: 'tipo_alerta_id' })
  tipo_alerta: AlertType;

  @Column({ name: 'nivel_prioridad_id' })
  nivel_prioridad_id: string;

  @ManyToOne(() => AlertPriority)
  @JoinColumn({ name: 'nivel_prioridad_id' })
  nivel_prioridad: AlertPriority;

  @Column({ name: 'estado_alerta_id' })
  estado_alerta_id: string;

  @ManyToOne(() => AlertState)
  @JoinColumn({ name: 'estado_alerta_id' })
  estado_alerta: AlertState;

  @Column({ type: 'varchar', length: 200 })
  titulo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ name: 'recomendacion_id', nullable: true })
  recomendacion_id: string;

  @CreateDateColumn({ name: 'fecha_deteccion' })
  fecha_deteccion: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_resolucion' })
  fecha_resolucion: Date;

  @Column({ name: 'resuelta_por', nullable: true })
  resuelta_por: string;

  @Column({ type: 'text', nullable: true, name: 'notas_resolucion' })
  notas_resolucion: string;

  @OneToMany(() => AlertAction, (action) => action.alerta)
  acciones: AlertAction[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
