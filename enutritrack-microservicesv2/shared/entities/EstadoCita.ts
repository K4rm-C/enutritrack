// shared/entities/EstadoCita.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { CitaMedica } from './CitaMedica';

@Entity('estados_cita')
export class EstadoCita {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'boolean', default: false, name: 'es_final' })
  esFinal!: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @OneToMany(() => CitaMedica, cita => cita.estadoCita)
  citas?: CitaMedica[];
}