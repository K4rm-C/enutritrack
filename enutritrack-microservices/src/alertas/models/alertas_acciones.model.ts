import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Alert } from './alertas.model';

@Entity('alertas_acciones')
export class AlertAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'alerta_id' })
  alerta_id: string;

  @ManyToOne(() => Alert, (alert) => alert.acciones)
  @JoinColumn({ name: 'alerta_id' })
  alerta: Alert;

  @Column({ name: 'doctor_id' })
  doctor_id: string;

  @Column({ type: 'varchar', length: 200, name: 'accion_tomada' })
  accion_tomada: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @CreateDateColumn({ name: 'fecha_accion' })
  fecha_accion: Date;
}
