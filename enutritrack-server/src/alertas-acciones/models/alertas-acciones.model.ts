import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Alerta } from '../../alertas/models/alertas.model';
import { PerfilDoctor } from '../../doctor/models/doctor.model';

@Entity('alertas_acciones')
export class AlertaAccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  alerta_id: string;

  @Column({ type: 'uuid' })
  doctor_id: string;

  @Column({ type: 'varchar', length: 200 })
  accion_tomada: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  fecha_accion: Date;

  @ManyToOne(() => Alerta)
  @JoinColumn({ name: 'alerta_id' })
  alerta: Alerta;

  @ManyToOne(() => PerfilDoctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: PerfilDoctor;
}
