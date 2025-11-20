// src/citas-medicas/entities/tipo-consulta.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('tipos_consulta')
export class TipoConsulta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'duracion_minutos', default: 30 })
  duracionMinutos: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
