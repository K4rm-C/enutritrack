import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Recomendacion } from '../../recommendation/models/recommendation.model';

@Entity('recomendacion_datos')
export class RecomendacionDato {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  recomendacion_id: string;

  @Column({ type: 'varchar', length: 100 })
  clave: string;

  @Column({ type: 'text' })
  valor: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tipo_dato: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Recomendacion, (recomendacion) => recomendacion.datos)
  @JoinColumn({ name: 'recomendacion_id' })
  recomendacion: Recomendacion;
}
