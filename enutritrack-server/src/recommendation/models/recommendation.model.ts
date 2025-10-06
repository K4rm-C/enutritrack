// src/recommendation/entities/recommendation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/models/user.model';

export enum RecommendationType {
  NUTRITION = 'nutrition',
  EXERCISE = 'exercise',
  MEDICAL = 'medical',
  GENERAL = 'general',
}

@Entity('recomendacion')
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.recommendations)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ type: 'text', name: 'tipo' })
  tipo: RecommendationType;

  @Column({ type: 'text', name: 'contenido' })
  contenido: string;

  @Column({ type: 'jsonb', nullable: true, name: 'datos_entrada' })
  datosEntrada: any;

  @Column({
    type: 'timestamp',
    name: 'fecha_generacion',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaGeneracion: Date;

  @Column({ type: 'timestamp', name: 'vigencia_hasta', nullable: true })
  vigenciaHasta: Date;

  @Column({ type: 'boolean', name: 'activa', default: true })
  activa: boolean;
}
