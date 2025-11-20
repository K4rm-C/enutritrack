import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { RecommendationData } from './recomendacion_datos';
import { RecommendationType } from './tipos_recomendacion.model';

@Entity('recomendacion')
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @Column({ name: 'tipo_recomendacion_id' })
  tipo_recomendacion_id: string;

  @ManyToOne(() => RecommendationType)
  @JoinColumn({ name: 'tipo_recomendacion_id' })
  tipo_recomendacion: RecommendationType;

  @Column({ type: 'text' })
  contenido: string;

  @CreateDateColumn({ name: 'fecha_generacion' })
  fecha_generacion: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'vigencia_hasta' })
  vigencia_hasta: Date;

  @Column({ type: 'boolean', default: true })
  activa: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  prioridad: string;

  @Column({ name: 'cita_medica_id', nullable: true })
  cita_medica_id: string;

  @Column({ name: 'alerta_generadora_id', nullable: true })
  alerta_generadora_id: string;

  @OneToMany(() => RecommendationData, (data) => data.recomendacion)
  datos: RecommendationData[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
