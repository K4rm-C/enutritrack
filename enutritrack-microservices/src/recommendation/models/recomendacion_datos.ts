import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Recommendation } from './recommendation.model';

@Entity('recomendacion_datos')
export class RecommendationData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'recomendacion_id' })
  recomendacion_id: string;

  @ManyToOne(() => Recommendation, (rec) => rec.datos)
  @JoinColumn({ name: 'recomendacion_id' })
  recomendacion: Recommendation;

  @Column({ type: 'varchar', length: 100 })
  clave: string;

  @Column({ type: 'text' })
  valor: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tipo_dato: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
