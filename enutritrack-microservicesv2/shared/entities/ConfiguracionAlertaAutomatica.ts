// shared/entities/ConfiguracionAlertaAutomatica.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PerfilUsuario } from './PerfilUsuario';
import { TipoAlerta } from './TipoAlerta';
import { PerfilDoctor } from './PerfilDoctor';

@Entity('configuracion_alertas_automaticas')
export class ConfiguracionAlertaAutomatica {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId!: string;

  @Column({ type: 'uuid', name: 'tipo_alerta_id' })
  tipoAlertaId!: string;

  @Column({ type: 'uuid', nullable: true, name: 'doctor_id' })
  doctorId?: string;

  @Column({ type: 'boolean', default: true, name: 'esta_activa' })
  estaActiva!: boolean;

  @Column({ type: 'jsonb', nullable: true, name: 'umbral_configuracion' })
  umbralConfiguracion?: any;

  @Column({ type: 'int', default: 24, name: 'frecuencia_verificacion_horas' })
  frecuenciaVerificacionHoras!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => PerfilUsuario, usuario => usuario.alertas)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: PerfilUsuario;

  @ManyToOne(() => TipoAlerta, tipoAlerta => tipoAlerta.configuraciones)
  @JoinColumn({ name: 'tipo_alerta_id' })
  tipoAlerta!: TipoAlerta;

  @ManyToOne(() => PerfilDoctor, doctor => doctor.alertas)
  @JoinColumn({ name: 'doctor_id' })
  doctor?: PerfilDoctor;
}