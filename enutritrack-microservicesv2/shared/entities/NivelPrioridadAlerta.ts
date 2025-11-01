// shared/entities/NivelPrioridadAlerta.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Alerta } from './Alerta';

@Entity('niveles_prioridad_alerta')
export class NivelPrioridadAlerta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'int', name: 'nivel_numerico' })
  nivelNumerico!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @OneToMany(() => Alerta, alerta => alerta.nivelPrioridad)
  alertas?: Alerta[];
}