// shared/entities/CategoriaAlerta.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { TipoAlerta } from './TipoAlerta';

@Entity('categorias_alerta')
export class CategoriaAlerta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @OneToMany(() => TipoAlerta, tipoAlerta => tipoAlerta.categoria)
  tiposAlerta?: TipoAlerta[];
}