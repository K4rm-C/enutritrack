// shared/entities/Medicamento.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PerfilUsuario } from './PerfilUsuario';

@Entity('medicamentos')
export class Medicamento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId!: string;

  @Column({ type: 'varchar', length: 200 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  dosis?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  frecuencia?: string;

  @Column({ type: 'date', name: 'fecha_inicio' })
  fechaInicio!: Date;

  @Column({ type: 'date', nullable: true, name: 'fecha_fin' })
  fechaFin?: Date;

  @Column({ type: 'text', nullable: true })
  notas?: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => PerfilUsuario, usuario => usuario.medicamentos)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: PerfilUsuario;
}