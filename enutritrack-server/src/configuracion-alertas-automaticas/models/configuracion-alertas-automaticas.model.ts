import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { PerfilUsuario } from '../../users/models/user.model';
import { PerfilDoctor } from '../../doctor/models/doctor.model';
import { TipoAlerta } from '../../tipos-alerta/models/tipos-alerta.model';

@Entity('configuracion_alertas_automaticas')
@Unique(['usuario_id', 'tipo_alerta_id'])
export class ConfiguracionAlertasAutomaticas {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  usuario_id: string;

  @Column({ type: 'uuid' })
  tipo_alerta_id: string;

  @Column({ type: 'uuid', nullable: true })
  doctor_id: string;

  @Column({ type: 'boolean', default: true })
  esta_activa: boolean;

  @Column({ type: 'jsonb', nullable: true })
  umbral_configuracion: any;

  @Column({ type: 'integer', default: 24 })
  frecuencia_verificacion_horas: number;

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

  @ManyToOne(() => TipoAlerta)
  @JoinColumn({ name: 'tipo_alerta_id' })
  tipo_alerta: TipoAlerta;
}
