// src/citas-medicas/entities/estado-cita.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('estados_cita')
export class EstadoCita {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'es_final', default: false })
  esFinal: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
