// shared/entities/Recomendacion.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PerfilUsuario } from './PerfilUsuario';
import { TipoRecomendacion } from './TipoRecomendacion';
import { CitaMedica } from './CitaMedica';
import { Alerta } from './Alerta';
import { RecomendacionDato } from './RecomendacionDato';

@Entity('recomendacion')
export class Recomendacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId!: string;

  @Column({ type: 'uuid', name: 'tipo_recomendacion_id' })
  tipoRecomendacionId!: string;

  @Column({ type: 'text' })
  contenido!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'fecha_generacion' })
  fechaGeneracion!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'vigencia_hasta' })
  vigenciaHasta?: Date;

  @Column({ type: 'boolean', default: true })
  activa!: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  prioridad?: string;

  @Column({ type: 'uuid', nullable: true, name: 'cita_medica_id' })
  citaMedicaId?: string;

  @Column({ type: 'uuid', nullable: true, name: 'alerta_generadora_id' })
  alertaGeneradoraId?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @ManyToOne(() => PerfilUsuario, usuario => usuario.recomendaciones)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: PerfilUsuario;

  @ManyToOne(() => TipoRecomendacion, tipoRecomendacion => tipoRecomendacion.recomendaciones)
  @JoinColumn({ name: 'tipo_recomendacion_id' })
  tipoRecomendacion!: TipoRecomendacion;

  @ManyToOne(() => CitaMedica, citaMedica => citaMedica.recomendaciones)
  @JoinColumn({ name: 'cita_medica_id' })
  citaMedica?: CitaMedica;

  @OneToMany(() => Alerta, alerta => alerta.recomendacion)
  alertasGeneradoras?: Alerta[];

  @OneToMany(() => RecomendacionDato, dato => dato.recomendacion)
  datos?: RecomendacionDato[];
}