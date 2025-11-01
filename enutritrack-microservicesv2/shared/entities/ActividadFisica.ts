// shared/entities/ActividadFisica.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PerfilUsuario } from './PerfilUsuario';
import { TipoActividad } from './TipoActividad';

@Entity('actividad_fisica')
export class ActividadFisica {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId!: string;

  @Column({ type: 'uuid', name: 'tipo_actividad_id' })
  tipoActividadId!: string;

  @Column({ type: 'int', name: 'duracion_min' })
  duracionMin!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'calorias_quemadas' })
  caloriasQuemadas!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  intensidad?: string;

  @Column({ type: 'text', nullable: true })
  notas?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha!: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @ManyToOne(() => PerfilUsuario, usuario => usuario.actividadesFisicas)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: PerfilUsuario;

  @ManyToOne(() => TipoActividad, tipoActividad => tipoActividad.actividades)
  @JoinColumn({ name: 'tipo_actividad_id' })
  tipoActividad!: TipoActividad;
}