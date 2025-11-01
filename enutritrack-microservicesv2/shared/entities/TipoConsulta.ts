// shared/entities/TipoConsulta.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { CitaMedica } from './CitaMedica';

@Entity('tipos_consulta')
export class TipoConsulta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'int', default: 30, name: 'duracion_minutos' })
  duracionMinutos!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @OneToMany(() => CitaMedica, cita => cita.tipoConsulta)
  citas?: CitaMedica[];
}