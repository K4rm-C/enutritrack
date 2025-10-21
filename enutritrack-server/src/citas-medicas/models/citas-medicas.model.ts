import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { PerfilUsuario } from '../../users/models/user.model';
import { PerfilDoctor } from '../../doctor/models/doctor.model';
import { TipoConsulta } from '../../tipos-consulta/models/tipos-consulta.model';
import { EstadoCita } from '../../estados-cita/models/estados-cita.model';

@Entity('citas_medicas')
export class CitaMedica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  usuario_id: string;

  @Column({ type: 'uuid' })
  doctor_id: string;

  @Column({ type: 'uuid' })
  tipo_consulta_id: string;

  @Column({ type: 'uuid' })
  estado_cita_id: string;

  @Column({ type: 'timestamp' })
  fecha_hora_programada: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_hora_inicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_hora_fin: Date;

  @Column({ type: 'text', nullable: true })
  motivo: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'text', nullable: true })
  diagnostico: string;

  @Column({ type: 'text', nullable: true })
  tratamiento_recomendado: string;

  @Column({ type: 'date', nullable: true })
  proxima_cita_sugerida: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => PerfilUsuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: PerfilUsuario;

  @ManyToOne(() => PerfilDoctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: PerfilDoctor;

  @ManyToOne(() => TipoConsulta)
  @JoinColumn({ name: 'tipo_consulta_id' })
  tipo_consulta: TipoConsulta;

  @ManyToOne(() => EstadoCita)
  @JoinColumn({ name: 'estado_cita_id' })
  estado_cita: EstadoCita;
}
