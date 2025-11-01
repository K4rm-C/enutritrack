// shared/entities/EstadoAlerta.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Alerta } from './Alerta';

@Entity('estados_alerta')
export class EstadoAlerta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @OneToMany(() => Alerta, alerta => alerta.estadoAlerta)
  alertas?: Alerta[];
}