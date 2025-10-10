import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Recomendacion } from '../../recommendation/models/recommendation.model';

@Entity('tipos_recomendacion')
export class TipoRecomendacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categoria: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(
    () => Recomendacion,
    (recomendacion) => recomendacion.tipoRecomendacion,
  )
  recomendaciones: Recomendacion[];
}
