// shared/entities/RecomendacionDato.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Recomendacion } from './Recomendacion';

@Entity('recomendacion_datos')
export class RecomendacionDato {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'recomendacion_id' })
  recomendacionId!: string;

  @Column({ type: 'varchar', length: 100 })
  clave!: string;

  @Column({ type: 'text' })
  valor!: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'tipo_dato' })
  tipoDato?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @ManyToOne(() => Recomendacion, recomendacion => recomendacion.datos)
  @JoinColumn({ name: 'recomendacion_id' })
  recomendacion!: Recomendacion;
}