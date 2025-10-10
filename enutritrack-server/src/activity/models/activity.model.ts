import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PerfilUsuario } from '../../users/models/user.model';
import { TipoActividad } from '../../tipo-actividad/models/tipo-actividad.model';

@Entity('actividad_fisica')
export class ActividadFisica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  usuario_id: string;

  @Column({ type: 'uuid' })
  tipo_actividad_id: string;

  @Column({ type: 'integer' })
  duracion_min: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  calorias_quemadas: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  intensidad: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  fecha: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => PerfilUsuario, (usuario) => usuario.id)
  @JoinColumn({ name: 'usuario_id' })
  usuario: PerfilUsuario;

  @ManyToOne(() => TipoActividad, (tipoActividad) => tipoActividad.id)
  @JoinColumn({ name: 'tipo_actividad_id' })
  tipoActividad: TipoActividad;
}
