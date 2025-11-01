// shared/entities/TipoRecomendacion.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Recomendacion } from './Recomendacion';

@Entity('tipos_recomendacion')
export class TipoRecomendacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categoria?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @OneToMany(() => Recomendacion, recomendacion => recomendacion.tipoRecomendacion)
  recomendaciones?: Recomendacion[];
}