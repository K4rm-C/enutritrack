import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CitaMedica } from '../../citas-medicas/models/citas-medicas.model';

@Entity('citas_medicas_vitales')
export class CitaMedicaVitales {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  cita_medica_id: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  peso: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  altura: number;

  @Column({ type: 'integer', nullable: true })
  tension_arterial_sistolica: number;

  @Column({ type: 'integer', nullable: true })
  tension_arterial_diastolica: number;

  @Column({ type: 'integer', nullable: true })
  frecuencia_cardiaca: number;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  temperatura: number;

  @Column({ type: 'integer', nullable: true })
  saturacion_oxigeno: number;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => CitaMedica)
  @JoinColumn({ name: 'cita_medica_id' })
  cita_medica: CitaMedica;
}
