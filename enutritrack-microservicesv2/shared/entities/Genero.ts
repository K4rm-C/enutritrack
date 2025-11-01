// shared/entities/Genero.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { PerfilUsuario } from './PerfilUsuario';

@Entity('generos')
export class Genero {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @OneToMany(() => PerfilUsuario, usuario => usuario.genero)
  usuarios?: PerfilUsuario[];
}