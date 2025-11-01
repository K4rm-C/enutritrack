// shared/entities/Alerta.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PerfilUsuario } from './PerfilUsuario';
import { PerfilDoctor } from './PerfilDoctor';
import { TipoAlerta } from './TipoAlerta';
import { NivelPrioridadAlerta } from './NivelPrioridadAlerta';
import { EstadoAlerta } from './EstadoAlerta';
import { Recomendacion } from './Recomendacion';
import { AlertaAccion } from './AlertaAccion';

@Entity('alertas')
export class Alerta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId!: string;

  @Column({ type: 'uuid', nullable: true, name: 'doctor_id' })
  doctorId?: string;

  @Column({ type: 'uuid', name: 'tipo_alerta_id' })
  tipoAlertaId!: string;

  @Column({ type: 'uuid', name: 'nivel_prioridad_id' })
  nivelPrioridadId!: string;

  @Column({ type: 'uuid', name: 'estado_alerta_id' })
  estadoAlertaId!: string;

  @Column({ type: 'varchar', length: 200 })
  titulo!: string;

  @Column({ type: 'text' })
  mensaje!: string;

  @Column({ type: 'uuid', nullable: true, name: 'recomendacion_id' })
  recomendacionId?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'fecha_deteccion' })
  fechaDeteccion!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_resolucion' })
  fechaResolucion?: Date;

  @Column({ type: 'uuid', nullable: true, name: 'resuelta_por' })
  resueltaPor?: string;

  @Column({ type: 'text', nullable: true, name: 'notas_resolucion' })
  notasResolucion?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => PerfilUsuario, usuario => usuario.alertas)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: PerfilUsuario;

  @ManyToOne(() => PerfilDoctor, doctor => doctor.alertas)
  @JoinColumn({ name: 'doctor_id' })
  doctor?: PerfilDoctor;

  @ManyToOne(() => TipoAlerta, tipoAlerta => tipoAlerta.alertas)
  @JoinColumn({ name: 'tipo_alerta_id' })
  tipoAlerta!: TipoAlerta;

  @ManyToOne(() => NivelPrioridadAlerta, nivelPrioridad => nivelPrioridad.alertas)
  @JoinColumn({ name: 'nivel_prioridad_id' })
  nivelPrioridad!: NivelPrioridadAlerta;

  @ManyToOne(() => EstadoAlerta, estadoAlerta => estadoAlerta.alertas)
  @JoinColumn({ name: 'estado_alerta_id' })
  estadoAlerta!: EstadoAlerta;

  @ManyToOne(() => Recomendacion, recomendacion => recomendacion.alertasGeneradoras)
  @JoinColumn({ name: 'recomendacion_id' })
  recomendacion?: Recomendacion;

  @ManyToOne(() => PerfilDoctor, doctor => doctor.alertas)
  @JoinColumn({ name: 'resuelta_por' })
  resueltaPorDoctor?: PerfilDoctor;

  @OneToMany(() => AlertaAccion, accion => accion.alerta)
  acciones?: AlertaAccion[];
}