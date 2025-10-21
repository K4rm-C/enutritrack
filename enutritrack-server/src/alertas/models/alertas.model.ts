import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PerfilUsuario } from '../../users/models/user.model';
import { PerfilDoctor } from '../../doctor/models/doctor.model';
import { TipoAlerta } from '../../tipos-alerta/models/tipos-alerta.model';
import { NivelPrioridadAlerta } from '../../niveles-prioridad-alerta/models/niveles-prioridad-alerta.model';
import { EstadoAlerta } from '../../estados-alerta/models/estados-alerta.model';
import { Recomendacion } from '../../recommendation/models/recommendation.model';

@Entity('alertas')
export class Alerta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  usuario_id: string;

  @Column({ type: 'uuid', nullable: true })
  doctor_id: string;

  @Column({ type: 'uuid' })
  tipo_alerta_id: string;

  @Column({ type: 'uuid' })
  nivel_prioridad_id: string;

  @Column({ type: 'uuid' })
  estado_alerta_id: string;

  @Column({ type: 'varchar', length: 200 })
  titulo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'uuid', nullable: true })
  recomendacion_id: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  fecha_deteccion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_resolucion: Date;

  @Column({ type: 'uuid', nullable: true })
  resuelta_por: string;

  @Column({ type: 'text', nullable: true })
  notas_resolucion: string;

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

  @ManyToOne(() => PerfilDoctor)
  @JoinColumn({ name: 'resuelta_por' })
  resuelta_por_doctor: PerfilDoctor;

  @ManyToOne(() => TipoAlerta)
  @JoinColumn({ name: 'tipo_alerta_id' })
  tipo_alerta: TipoAlerta;

  @ManyToOne(() => NivelPrioridadAlerta)
  @JoinColumn({ name: 'nivel_prioridad_id' })
  nivel_prioridad: NivelPrioridadAlerta;

  @ManyToOne(() => EstadoAlerta)
  @JoinColumn({ name: 'estado_alerta_id' })
  estado_alerta: EstadoAlerta;

  @ManyToOne(() => Recomendacion)
  @JoinColumn({ name: 'recomendacion_id' })
  recomendacion: Recomendacion;
}
