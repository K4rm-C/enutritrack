// src/citas-medicas/models/cita-medica.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/models/user.model';
import { Doctor } from '../../doctor/models/doctor.model';
import { TipoConsulta } from './tipo-consulta.model';
import { EstadoCita } from './estado-cita.model';

@Entity('citas_medicas')
export class CitaMedica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => TipoConsulta)
  @JoinColumn({ name: 'tipo_consulta_id' })
  tipoConsulta: TipoConsulta;

  @ManyToOne(() => EstadoCita)
  @JoinColumn({ name: 'estado_cita_id' })
  estadoCita: EstadoCita;

  @Column({ type: 'timestamp', name: 'fecha_hora_programada' })
  fechaHoraProgramada: Date;

  @Column({ type: 'timestamp', name: 'fecha_hora_inicio', nullable: true })
  fechaHoraInicio: Date;

  @Column({ type: 'timestamp', name: 'fecha_hora_fin', nullable: true })
  fechaHoraFin: Date;

  @Column({ type: 'text', nullable: true })
  motivo: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'text', nullable: true })
  diagnostico: string;

  @Column({ type: 'text', name: 'tratamiento_recomendado', nullable: true })
  tratamientoRecomendado: string;

  @Column({ type: 'date', name: 'proxima_cita_sugerida', nullable: true })
  proximaCitaSugerida: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
