// shared/entities/CondicionMedica.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PerfilUsuario } from './PerfilUsuario';

export type CondicionMedicaSeveridadEnum = 'leve' | 'moderada' | 'grave';

@Entity('condiciones_medicas')
export class CondicionMedica {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId!: string;

  @Column({ type: 'varchar', length: 200 })
  nombre!: string;

  @Column({ 
    type: 'enum', 
    enum: ['leve', 'moderada', 'grave'],
    nullable: true
  })
  severidad?: CondicionMedicaSeveridadEnum;

  @Column({ type: 'date', nullable: true, name: 'fecha_diagnostico' })
  fechaDiagnostico?: Date;

  @Column({ type: 'text', nullable: true })
  notas?: string;

  @Column({ type: 'boolean', default: true })
  activa!: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => PerfilUsuario, usuario => usuario.condicionesMedicas)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: PerfilUsuario;
}